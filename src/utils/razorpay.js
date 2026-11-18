import axios from 'axios';
import { API_BASE } from '../services/api.service';

const RAZORPAY_KEY_ID =
  process.env.REACT_APP_RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  'rzp_live_TNdSmDOKSX2g6I';

// 📜 Load Razorpay Checkout SDK Script
export const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// 💳 Initiate Razorpay Checkout with Live Keys, Coupon Support & Auto-Capture Polling
export const initiateRazorpayCheckout = async ({
  plan = 'pro',
  billingCycle = 'monthly',
  seats = 10,
  employeeSeats = 0,
  managerSeats = 0,
  addonType = 'none',
  organizationId = '',
  userName = '',
  userEmail = '',
  userPhone = '',
  companyName = 'KisanConnect SaaS',
  couponCode = '',
  onSuccess = () => {},
  onFailure = () => {},
}) => {
  let paymentResolved = false;
  let pollInterval = null;

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  try {
    // 1. Ensure Razorpay SDK script is loaded
    const resLoaded = await loadRazorpaySDK();
    if (!resLoaded) {
      alert('Failed to load Razorpay Payment Gateway SDK. Please check your internet connection.');
      onFailure({ message: 'SDK load failed' });
      return;
    }

    // 2. Create Order on Backend Server (handles exact 5% OFF on Yearly, Seat Addons and Coupon deductions)
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post(
      `${API_BASE}/payment/create-order`,
      {
        plan,
        billingCycle,
        seats,
        employeeSeats,
        managerSeats,
        addonType,
        organizationId,
        userEmail,
        userName,
        couponCode,
      },
      { headers }
    );

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Order creation failed');
    }

    const { orderId, amount, currency, keyId } = response.data;
    const razorpayKey = keyId || RAZORPAY_KEY_ID;

    const isAddon = ['employee_addon', 'manager_addon', 'seat_addon', 'addon'].includes(plan);
    const descriptionText = isAddon
      ? `Staff Top-Up: ${employeeSeats > 0 ? `${employeeSeats} Employee(s)` : ''} ${managerSeats > 0 ? `${managerSeats} Manager(s)` : ''} (${companyName})`
      : `${plan.toUpperCase()} Plan Subscription (${billingCycle.toUpperCase()} - ${billingCycle === 'yearly' ? '5% OFF' : 'Standard'})`;

    let rzpInstance = null;

    // 3. Configure Razorpay Popup Options
    const options = {
      key: razorpayKey,
      amount: amount,
      currency: currency || 'INR',
      name: companyName || 'KisanConnect SaaS Platform',
      description: descriptionText,
      image: '/images/superCompanyLOGO.png',
      order_id: orderId,
      handler: async function (paymentResponse) {
        if (paymentResolved) return;
        paymentResolved = true;
        stopPolling();

        try {
          // 4. Verify Payment Signature on Backend Server
          const verifyRes = await axios.post(
            `${API_BASE}/payment/verify-payment`,
            {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              organizationId,
              plan,
              billingCycle,
              seats,
              employeeSeats,
              managerSeats,
              addonType,
              couponCode,
            },
            { headers }
          );

          if (verifyRes.data && verifyRes.data.success) {
            onSuccess(verifyRes.data);
          } else {
            alert('Payment Signature Verification Failed!');
            onFailure(verifyRes.data);
          }
        } catch (verifyErr) {
          console.error('🔥 Payment Verification Error:', verifyErr);
          alert('Error verifying payment: ' + (verifyErr.response?.data?.message || verifyErr.message));
          onFailure(verifyErr);
        }
      },
      prefill: {
        name: userName || 'Admin',
        email: userEmail || 'admin@company.com',
        contact: userPhone || '+919511450914',
      },
      notes: {
        plan,
        billingCycle,
        companyName,
        couponCode,
      },
      theme: {
        color: '#059669', // Emerald Green brand primary
      },
      modal: {
        ondismiss: function () {
          console.log('Payment checkout popup closed by user');
          // Allow background polling to continue for 20 more seconds in case user finished UPI on mobile phone right as modal was dismissed
          setTimeout(() => {
            if (!paymentResolved) stopPolling();
          }, 20000);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzpInstance = rzp;

    rzp.on('payment.failed', async function (paymentFailResponse) {
      console.error('Payment Failed:', paymentFailResponse.error);
      const desc = paymentFailResponse.error?.description || '';
      try {
        await axios.post(`${API_BASE}/payment/record-failure`, {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentFailResponse.error?.metadata?.payment_id || '',
          error: paymentFailResponse.error,
        }, { headers });
      } catch (e) {
        // Ignore failure reporting error
      }

      if (desc.toLowerCase().includes('website does not match registered')) {
        stopPolling();
        alert(
          '⚠️ Razorpay Live Security Notice:\n\n' +
          'Payment was blocked because this website domain (' + window.location.hostname + ') is not registered in your Razorpay Dashboard.\n\n' +
          'To enable Live Payments:\n' +
          '1. Log into your Razorpay Merchant Dashboard.\n' +
          '2. Go to Settings > Website and App Details.\n' +
          '3. Add "' + window.location.origin + '" to your registered websites.\n\n' +
          'Note: You can also use the "Instant Activate & Verify" button in your Billing dashboard to activate your plan immediately!'
        );
        onFailure(paymentFailResponse.error);
      } else {
        // Don't stop polling immediately if it was just an interaction glitch, but report failure
        onFailure(paymentFailResponse.error);
      }
    });

    rzp.open();

    // ⚡ Real-Time Phone/UPI Background Poller:
    // If the user approves payment via UPI/QR on their phone, the desktop modal might not get the browser callback.
    // We poll `/payment/sync-order` every 2.5s for up to 3 minutes to auto-detect and capture the payment!
    pollInterval = setInterval(async () => {
      if (paymentResolved) {
        stopPolling();
        return;
      }
      try {
        const syncRes = await axios.post(
          `${API_BASE}/payment/sync-order`,
          { orderId },
          { headers }
        );
        if (syncRes.data && syncRes.data.success && (syncRes.data.status === 'paid' || syncRes.data.payment?.status === 'paid')) {
          paymentResolved = true;
          stopPolling();
          try {
            if (rzpInstance && typeof rzpInstance.close === 'function') {
              rzpInstance.close();
            }
          } catch (e) {}
          onSuccess(syncRes.data);
        }
      } catch (e) {
        // Silently continue polling
      }
    }, 2500);

    // Safety timeout: stop polling after 3.5 minutes
    setTimeout(stopPolling, 210000);
  } catch (err) {
    stopPolling();
    console.error('🔥 Razorpay Checkout Error:', err);
    alert('Failed to launch Razorpay Checkout: ' + (err.response?.data?.message || err.message));
    onFailure(err);
  }
};
