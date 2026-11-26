import { useState } from "react";
import "./Offers.css";
import { FiCopy, FiCheck, FiTag, FiGift, FiCreditCard, FiPercent, FiTrendingUp } from "react-icons/fi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";

const OFFERS_LIST = [
  {
    code: "SWIGGY50",
    discount: "50% OFF",
    upTo: "Up to ₹100",
    minOrder: "Min order ₹199",
    description: "Get 50% discount on all popular restaurants in Madurai. Valid once per user.",
    color: "#fc8019",
    tag: "Trending",
  },
  {
    code: "WELCOME20",
    discount: "20% OFF",
    upTo: "Up to ₹60",
    minOrder: "Min order ₹149",
    description: "Special welcome treat for food lovers! Applicable on all foods & drinks.",
    color: "#1ba672",
    tag: "First Order",
  },
  {
    code: "FREEDEL",
    discount: "FREE DELIVERY",
    upTo: "Save ₹30",
    minOrder: "Min order ₹199",
    description: "Zero delivery fees on your lunch & dinner orders today!",
    color: "#3b82f6",
    tag: "Zero Fee",
  },
  {
    code: "SUPER60",
    discount: "60% OFF",
    upTo: "Up to ₹120",
    minOrder: "Min order ₹249",
    description: "Super saver discount on select biryani & pizza restaurants.",
    color: "#8b5cf6",
    tag: "Super Saver",
  },
  {
    code: "MADURAI100",
    discount: "₹100 FLAT OFF",
    upTo: "Flat ₹100",
    minOrder: "Min order ₹399",
    description: "Special city promo for top restaurant chains across Madurai.",
    color: "#ec4899",
    tag: "City Special",
  },
];

const PAYMENT_OFFERS = [
  {
    bank: "HDFC Bank Credit Cards",
    offer: "Flat ₹75 instant cashback on orders above ₹399",
    code: "HDFC75",
  },
  {
    bank: "Cred Pay UPI",
    offer: "Up to ₹50 cashback directly credited to your wallet",
    code: "CREDPAY",
  },
  {
    bank: "ICICI Bank Net Banking",
    offer: "10% off up to ₹80 on minimum bill value of ₹300",
    code: "ICICI10",
  },
  {
    bank: "Paytm Wallet",
    offer: "Assured scratch card with rewards up to ₹100",
    code: "PAYTM100",
  },
];

function Offers() {
  const [copiedCode, setCopiedCode] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'coupons', 'bank'

  useScrollReveal([filterType]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied! Apply it in your cart. 🎉`);
    setTimeout(() => setCopiedCode(""), 3000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="offersPage">
      {/* Header Banner */}
      <div className="offersHero reveal-on-scroll" data-reveal="fade-down">
        <div className="heroTag">
          <FiGift /> Exclusive Vouchers & Vault
        </div>
        <h1>Restaurants Offers & Promo Codes</h1>
        <p>Save big on your next meal with handpicked discount coupons and payment rewards</p>
      </div>

      {/* STICKY OFFERS NAV */}
      <div className="offersStickyNav">
        <div className="offersNavPills">
          <button
            className={`offerPillBtn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            <FiTrendingUp /> All Offers ({OFFERS_LIST.length + PAYMENT_OFFERS.length})
          </button>
          <button
            className={`offerPillBtn ${filterType === "coupons" ? "active" : ""}`}
            onClick={() => {
              setFilterType("coupons");
              scrollToSection("coupons-sec");
            }}
          >
            <FiPercent /> Restaurant Coupons ({OFFERS_LIST.length})
          </button>
          <button
            className={`offerPillBtn ${filterType === "bank" ? "active" : ""}`}
            onClick={() => {
              setFilterType("bank");
              scrollToSection("bank-sec");
            }}
          >
            <FiCreditCard /> Bank & Wallet Deals ({PAYMENT_OFFERS.length})
          </button>
        </div>
      </div>

      {/* Coupons Section */}
      {(filterType === "all" || filterType === "coupons") && (
        <section id="coupons-sec" className="offersSectionGroup">
          <div className="sectionTitleRow">
            <FiTag className="secIcon" />
            <h2>Best Available Restaurant Coupons</h2>
          </div>

          <div className="couponsGrid">
            {OFFERS_LIST.map((coupon, idx) => {
              const isCopied = copiedCode === coupon.code;
              return (
                <div
                  className="couponCardModern reveal-on-scroll"
                  data-reveal="3d-flip"
                  data-reveal-delay={(idx % 3) * 80}
                  key={coupon.code}
                >
                  <div className="couponLeftBorder" style={{ background: coupon.color }}></div>

                  <div className="couponCardContent">
                    <div className="couponTopRow">
                      <span className="couponDiscount" style={{ color: coupon.color }}>
                        {coupon.discount}
                      </span>
                      <span className="minOrderTag">{coupon.upTo}</span>
                    </div>

                    <p className="couponDesc">{coupon.description}</p>
                    <small className="minOrderDesc">{coupon.minOrder}</small>

                    <div className="couponActionRow">
                      <div className="couponCodeBadge">
                        <strong>{coupon.code}</strong>
                        {coupon.tag && <span className="couponSubTag">{coupon.tag}</span>}
                      </div>

                      <button
                        className={`copyCouponBtn ${isCopied ? "copied" : ""}`}
                        onClick={() => copyCode(coupon.code)}
                      >
                        {isCopied ? (
                          <>
                            <FiCheck /> COPIED
                          </>
                        ) : (
                          <>
                            <FiCopy /> COPY CODE
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Bank Offers Section */}
      {(filterType === "all" || filterType === "bank") && (
        <section id="bank-sec" className="offersSectionGroup">
          <div className="sectionTitleRow paymentSecTitle">
            <FiCreditCard className="secIcon" />
            <h2>Bank & Wallet Partnerships</h2>
          </div>

          <div className="paymentOffersGrid">
            {PAYMENT_OFFERS.map((po, idx) => {
              const isCopied = copiedCode === po.code;
              return (
                <div
                  className="bankCard reveal-on-scroll"
                  data-reveal="fade-up"
                  data-reveal-delay={(idx % 2) * 100}
                  key={idx}
                >
                  <div className="bankCardHeader">
                    <h4>{po.bank}</h4>
                    <span className="cashbackBadge">Cashback</span>
                  </div>
                  <p>{po.offer}</p>
                  <div className="bankCardFooter">
                    <span className="codePill">{po.code}</span>
                    <button
                      className="bankCopyBtn"
                      onClick={() => copyCode(po.code)}
                    >
                      {isCopied ? "Copied ✓" : "Copy Code"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="offersCtaBanner reveal-on-scroll" data-reveal="zoom-fade">
        <h3>Ready to satisfy your cravings?</h3>
        <p>Explore thousands of dishes delivered hot to your doorstep.</p>
        <Link to="/" className="exploreFoodBtn">
          Order Food Now
        </Link>
      </div>
    </div>
  );
}

export default Offers;
