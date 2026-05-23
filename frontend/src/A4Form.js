import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./A4Form.css";
import logo from "./assets/conicalFlask.png";

// Helper function to convert number to words in Rupees
const numberToWords = (num) => {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const g = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
  };

  const h = (n) => {
    if (n < 100) return g(n);
    return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + g(n % 100) : "");
  };

  let str = "";
  let n = Math.floor(num);

  if (n >= 10000000) {
    str += h(Math.floor(n / 10000000)) + " Crore ";
    n %= 10000000;
  }
  if (n >= 100000) {
    str += h(Math.floor(n / 100000)) + " Lakh ";
    n %= 100000;
  }
  if (n >= 1000) {
    str += h(Math.floor(n / 1000)) + " Thousand ";
    n %= 1000;
  }
  if (n > 0) {
    str += h(n);
  }
  return str.trim() + " Rupees Only";
};

const A4Form = () => {
  const formRef = useRef(null);
  const location = useLocation();
  const orderData = location.state?.order;

  // Invoice headers state
  const [billToTitle, setBillToTitle] = useState("THE PRINCIPAL");
  const [school, setSchool] = useState(orderData ? orderData.schoolName : "School / Institution Name");
  const [bookNo, setBookNo] = useState("1");
  const [billNo, setBillNo] = useState(orderData ? String(orderData.ID) : "9");
  const [date, setDate] = useState(() => {
    if (orderData && orderData.CreatedAt) {
      const d = new Date(orderData.CreatedAt);
      return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    }
    return new Date().toLocaleDateString("en-GB");
  });
  const [orderNo, setOrderNo] = useState("");

  // 25 table rows state
  const [rows, setRows] = useState(() => {
    const initialRows = Array.from({ length: 25 }).map(() => ({
      description: "",
      quantity: "",
      rate: "",
      amount: "",
    }));

    if (orderData && orderData.items) {
      orderData.items.forEach((item, index) => {
        if (index < 25) {
          initialRows[index] = {
            description: item.productName || "",
            quantity: String(item.quantity || 1),
            rate: String(item.rate || 0),
            amount: String(item.amount || 0),
          };
        }
      });
    }
    return initialRows;
  });

  const [freight, setFreight] = useState("0.00");

  // Calculate totals dynamically
  const subTotal = rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
  const grandTotal = subTotal + (parseFloat(freight) || 0);
  const amountInWords = numberToWords(grandTotal);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "quantity" || field === "rate") {
      const q = parseFloat(updatedRows[index].quantity) || 0;
      const r = parseFloat(updatedRows[index].rate) || 0;
      updatedRows[index].amount = q && r ? (q * r).toFixed(2) : "";
    }
    setRows(updatedRows);
  };

  const handleDownloadPDF = async () => {
    const formElement = formRef.current;
    if (!formElement) return;

    const downloadButton = document.getElementById("download-button");
    if (downloadButton) downloadButton.style.display = "none";

    const canvas = await html2canvas(formElement, {
      scale: 3,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");

    if (downloadButton) downloadButton.style.display = "block";

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Shree-Scientific-Bill.pdf");
  };

  return (
    <div className="a4-form-container">
      <div ref={formRef} className="a4-form">
        <div className="bill-container">
          {/* Professional Header */}
          <div className="header">
            <div className="logo-section">
              <img src={logo} alt="SSC Logo" className="beaker-logo" />
            </div>

            <div className="company-center">
              <h1 className="company-name">SHREE SCIENTIFIC CENTER</h1>
              <div className="tagline">
                Chemicals • Glassware • Instruments • Lab Supplies
              </div>
              <div className="bill-type">BILL / CASH MEMO</div>
            </div>

            <div className="header-right">
              <div className="gst-box">GSTIN: 23BQOPS2199M2ZZ</div>
              <div className="contact">
                Mob.: 9340120216
                <br />
                9343477532
                <br />
                9424906892
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="address-line">
            Near Holy Home School, Infunt Nagar Balaghat Plaza,
            <br />
            Gayatri Mandir Road, Prem Nagar, Balaghat - 481001 (M.P.)
          </div>

          {/* Bill To + Invoice Info */}
          <div className="bill-to-row">
            <div className="bill-to">
              <div className="label">Bill To :</div>
              <input
                type="text"
                className="bill-to-input"
                placeholder="THE PRINCIPAL"
                value={billToTitle}
                onChange={(e) => setBillToTitle(e.target.value)}
              />
              <input
                type="text"
                className="bill-to-input school"
                placeholder="School / Institution Name"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>

            <div className="invoice-info">
              <div>
                <span className="label">Book No. :</span>
                <input
                  type="text"
                  className="small-input"
                  value={bookNo}
                  onChange={(e) => setBookNo(e.target.value)}
                />
              </div>
              <div>
                <span className="label">Bill No. :</span>
                <input
                  type="text"
                  className="small-input"
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                />
              </div>
              <div>
                <span className="label">Date :</span>
                <input
                  type="text"
                  className="small-input"
                  placeholder="DD/MM/YYYY"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <span className="label">Your Order No. :</span>
                <input
                  type="text"
                  className="order-input"
                  placeholder="________________"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Professional Table - 25 rows */}
          <table className="bill-table">
            <thead>
              <tr>
                <th className="sno">S.No.</th>
                <th className="desc">DESCRIPTION OF ITEM</th>
                <th className="qty">Quantity</th>
                <th className="rate">Rate (₹)</th>
                <th className="amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="sno-cell">
                    {(i + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="desc-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="Item name / specification"
                      value={row.description}
                      onChange={(e) => handleRowChange(i, "description", e.target.value)}
                    />
                  </td>
                  <td className="qty-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="Nos / Pcs"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(i, "quantity", e.target.value)}
                    />
                  </td>
                  <td className="rate-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="0.00"
                      value={row.rate}
                      onChange={(e) => handleRowChange(i, "rate", e.target.value)}
                    />
                  </td>
                  <td className="amount-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="0.00"
                      value={row.amount}
                      onChange={(e) => handleRowChange(i, "amount", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Amount in Words */}
          <div className="amount-in-words" style={{ marginBottom: "15px", fontWeight: "bold", border: "2px solid #9c0f0f", padding: "6px 12px", fontSize: "11px" }}>
            Amount in Words: <span style={{ textTransform: "uppercase", color: "#9c0f0f" }}>{amountInWords}</span>
          </div>

          {/* Totals */}
          <div className="totals-section">
            <div className="totals">
              <div className="totals-labels">
                <div>SUB TOTAL</div>
                <div>LESS / Freight</div>
                <div className="grand">G. TOTAL</div>
              </div>
              <div className="totals-values">
                <div>₹ {subTotal.toFixed(2)}</div>
                <div>
                  ₹{" "}
                  <input
                    type="text"
                    style={{ width: "80px", textAlign: "right", display: "inline-block", fontWeight: "bold", border: "none", outline: "none", background: "transparent" }}
                    value={freight}
                    onChange={(e) => setFreight(e.target.value)}
                  />
                </div>
                <div className="grand-value">₹ {grandTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bank-details">
            <div className="bank-title">Bank Details :</div>
            <div>Bank Name : Bank of India</div>
            <div>IFSC Code : BKID0009590</div>
            <div>A/c No. : 959020110000260</div>
          </div>

          {/* Terms */}
          <div className="terms-section">
            <div className="terms-title">TERMS & CONDITIONS :</div>
            <div className="terms-text">
              1. All disputes are Subject to Balaghat Jurisdiction Only
              <br />
              2. All goods are for laboratory use only (not for medical use)
              <br />
              3. Payment not received within 15 days will attract 24% interest
              per annum.
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="thank-you">Thank you for your business</div>
            <div className="watermark">SHREE SCIENTIFIC CENTER • BALAGHAT</div>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button
          id="download-button"
          onClick={handleDownloadPDF}
          className="download-button"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default A4Form;
