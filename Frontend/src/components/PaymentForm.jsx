import React, { useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  CheckCircle2,
  Circle,
  QrCode,
  Zap,
  Sparkles,
} from "lucide-react";

const PaymentForm = ({
  totalAmount = 0,
  selectedMethod = "upi",
  setSelectedMethod = () => {},
  upiId = "",
  setUpiId = () => {},
  userPhone = "",
  selectedBank = "",
  setSelectedBank = () => {},
  selectedWallet = "",
  setSelectedWallet = () => {},
}) => {
  const [upiMode, setUpiMode] = useState("id"); // 'id' | 'qr'
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      desc: "Google Pay, PhonePe, Paytm, BHIM & UPI IDs",
      icon: Smartphone,
      popular: true,
      badge: "Instant 0% Fee",
    },
    {
      id: "card",
      name: "Credit / Debit Cards",
      desc: "Visa, MasterCard, RuPay, Maestro & Diners",
      icon: CreditCard,
      popular: false,
      badge: "All Cards Supported",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      desc: "All Indian Banks (SBI, HDFC, ICICI, Axis & more)",
      icon: Building2,
      popular: false,
      badge: "50+ Banks",
    },
    {
      id: "wallet",
      name: "Wallets",
      desc: "PhonePe, Amazon Pay, Mobikwik & others",
      icon: Wallet,
      popular: false,
      badge: "Top Wallets",
    },
  ];

  const popularBanks = [
    { id: "HDFC", name: "HDFC Bank" },
    { id: "SBIN", name: "State Bank of India" },
    { id: "ICIC", name: "ICICI Bank" },
    { id: "UTIB", name: "Axis Bank" },
    { id: "KKBK", name: "Kotak Mahindra" },
    { id: "PUNB_R", name: "Punjab National Bank" },
  ];

  const popularWallets = [
    { id: "phonepe", name: "PhonePe Wallet" },
    { id: "amazonpay", name: "Amazon Pay" },
    { id: "mobikwik", name: "MobiKwik" },
    { id: "airtel", name: "Airtel Money" },
  ];

  const popularUpiApps = [
    { id: "gpay", name: "Google Pay", handle: "okaxis", color: "#4285F4" },
    { id: "phonepe", name: "PhonePe", handle: "ybl", color: "#5f259f" },
    { id: "paytm", name: "Paytm", handle: "paytm", color: "#00b9f5" },
    { id: "bhim", name: "BHIM UPI", handle: "upi", color: "#0078D7" },
  ];

  const popularUpiHandles = ["@ybl", "@okaxis", "@paytm", "@upi", "@okhdfcbank", "@oksbi", "@ibl", "@axl"];

  const [selectedUpiApp, setSelectedUpiApp] = useState("phonepe");

  // Validate UPI ID format
  const isUpiValid = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim());

  const handleSelectUpiApp = (app) => {
    setSelectedUpiApp(app.id);
    let base = "";
    if (upiId && upiId.includes("@")) {
      base = upiId.split("@")[0];
    } else if (upiId) {
      base = upiId;
    } else if (userPhone) {
      base = userPhone.replace(/\D/g, "");
    }

    if (base) {
      setUpiId(`${base}@${app.handle}`);
    } else {
      setUpiId(`@${app.handle}`);
    }
  };

  const handleApplyHandle = (handle) => {
    let base = "";
    if (upiId && upiId.includes("@")) {
      base = upiId.split("@")[0];
    } else if (upiId) {
      base = upiId;
    } else if (userPhone) {
      base = userPhone.replace(/\D/g, "");
    }

    if (base) {
      setUpiId(`${base}${handle}`);
    } else {
      setUpiId(handle);
    }
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    val = val.replace(/(.{4})/g, "$1 ").trim();
    setCardDetails((prev) => ({ ...prev, number: val }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardDetails((prev) => ({ ...prev, expiry: val }));
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-base shadow-sm">
            ₹
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              Select Payment Method
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/25">
                Razorpay Verified
              </span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Choose how you want to pay with Razorpay
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit Encrypted</span>
        </div>
      </div>

      {/* Methods Selectable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              type="button"
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex items-start gap-3.5 group cursor-pointer ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-2 ring-primary/40"
                  : "bg-secondary/30 border-border/60 hover:border-primary/40 hover:bg-secondary/50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-bold text-xs ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {method.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {method.popular && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground leading-none">
                        POPULAR
                      </span>
                    )}
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 group-hover:text-muted-foreground" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {method.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC INTERACTIVE SUB-PANEL BASED ON SELECTED METHOD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-secondary/25 border border-border/60 space-y-4 animate-fade-in-up">
        {selectedMethod === "upi" && (
          <div className="space-y-4">
            {/* Header with Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Pay with UPI
              </span>

              {/* Sub-tabs: UPI ID vs QR Code */}
              <div className="flex items-center p-1 bg-secondary/60 rounded-xl border border-border/60 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setUpiMode("id")}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    upiMode === "id"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI ID / App</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUpiMode("qr")}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    upiMode === "qr"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Code</span>
                </button>
              </div>
            </div>

            {upiMode === "qr" ? (
              /* DYNAMIC UPI QR CODE VIEW */
              <div className="p-5 rounded-2xl bg-secondary/40 border border-primary/20 text-center space-y-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    Instant UPI QR
                  </span>
                  <h5 className="text-sm font-bold text-foreground">
                    Scan & Pay ₹{Number(totalAmount).toFixed(2)}
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    Scan using Google Pay, PhonePe, Paytm, BHIM, or any banking app
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="relative inline-block p-3.5 bg-white rounded-2xl shadow-xl mx-auto border-2 border-primary/30">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      `upi://pay?pa=razorpay.test@okaxis&pn=E-Commerce&am=${totalAmount}&cu=INR&tn=Order_Checkout`
                    )}`}
                    alt="UPI Payment QR Code"
                    className="w-36 h-36 mx-auto rounded-lg object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Supported UPI Apps Row */}
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  {popularUpiApps.map((app) => (
                    <span
                      key={app.id}
                      className="px-2.5 py-1 rounded-lg bg-secondary/60 text-[10px] font-semibold text-foreground border border-border/50"
                    >
                      {app.name}
                    </span>
                  ))}
                </div>

                <div className="pt-1">
                  <a
                    href={`upi://pay?pa=razorpay.test@okaxis&pn=E-Commerce&am=${totalAmount}&cu=INR&tn=Order_Checkout`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open in your mobile UPI App</span>
                  </a>
                </div>
              </div>
            ) : (
              /* UPI ID & APP SELECTION VIEW */
              <div className="space-y-4">
                {/* Popular UPI Apps Clickable Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {popularUpiApps.map((app) => {
                    const isAppSelected =
                      selectedUpiApp === app.id ||
                      (upiId && upiId.endsWith(`@${app.handle}`));

                    return (
                      <button
                        type="button"
                        key={app.id}
                        onClick={() => handleSelectUpiApp(app)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isAppSelected
                            ? "bg-primary/15 border-primary shadow-md ring-2 ring-primary/40 text-primary"
                            : "bg-secondary/50 border-border/60 text-foreground hover:bg-secondary hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{app.name}</span>
                          {isAppSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          @{app.handle}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* UPI ID / VPA Input with validation badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-foreground">
                      UPI ID / VPA
                    </label>
                    {upiId && (
                      <span
                        className={`text-[10px] font-semibold flex items-center gap-1 ${
                          isUpiValid ? "text-emerald-500" : "text-amber-500"
                        }`}
                      >
                        {isUpiValid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Valid UPI Format
                          </>
                        ) : (
                          "Format: name@bank"
                        )}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 7268973781@ybl or username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-secondary/50 border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono transition-colors ${
                        upiId && isUpiValid
                          ? "border-emerald-500/60 ring-1 ring-emerald-500/30"
                          : "border-border/60"
                      }`}
                    />
                  </div>

                  {/* Quick Handle Completion Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-muted-foreground mr-1">
                      Quick handles:
                    </span>
                    {popularUpiHandles.map((handle) => (
                      <button
                        type="button"
                        key={handle}
                        onClick={() => handleApplyHandle(handle)}
                        className="px-2 py-0.5 rounded-lg bg-secondary/80 hover:bg-primary/20 text-muted-foreground hover:text-foreground text-[10px] font-mono border border-border/50 transition-colors cursor-pointer"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMethod === "card" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                Card Payment via Razorpay
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  Visa
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  MasterCard
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  RuPay
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4532 •••• •••• 8910"
                  value={cardDetails.number}
                  onChange={handleCardNumberChange}
                  className="w-full px-3.5 py-2 bg-secondary/50 border border-border/60 rounded-xl text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Valid Thru (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={cardDetails.expiry}
                    onChange={handleExpiryChange}
                    className="w-full px-3.5 py-2 bg-secondary/50 border border-border/60 rounded-xl text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cvv: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    className="w-full px-3.5 py-2 bg-secondary/50 border border-border/60 rounded-xl text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Card details are tokenized & 100% RBI-compliant securely on Razorpay.
            </p>
          </div>
        )}

        {selectedMethod === "netbanking" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                Select Your Bank
              </span>
              <span className="text-[10px] text-muted-foreground">
                All major Indian banks
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {popularBanks.map((bank) => {
                const isBankSelected = selectedBank === bank.id;
                return (
                  <button
                    type="button"
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-semibold ${
                      isBankSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/40 border-border/50 text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {bank.name}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground text-center pt-1">
              50+ additional banks available inside the Razorpay modal.
            </p>
          </div>
        )}

        {selectedMethod === "wallet" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-primary" />
                Select Wallet
              </span>
              <span className="text-[10px] text-emerald-500 font-medium">
                Instant Cashback Eligible
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {popularWallets.map((wallet) => {
                const isWalletSelected = selectedWallet === wallet.id;
                return (
                  <button
                    type="button"
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-semibold ${
                      isWalletSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/40 border-border/50 text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {wallet.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Security Trust Note */}
      <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Your transaction is secured with bank-grade 256-bit SSL encryption.</span>
      </div>
    </div>
  );
};

export default PaymentForm;
