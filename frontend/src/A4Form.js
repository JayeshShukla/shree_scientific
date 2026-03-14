import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./A4Form.css";
import logo from "./assets/conicalFlask.png";

const A4Form = () => {
  const formRef = useRef(null);

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
                defaultValue="THE PRINCIPAL"
              />
              <input
                type="text"
                className="bill-to-input school"
                placeholder="School / Institution Name"
                defaultValue="P.M. SHRI G.H.S.S. KUMARAPALAYAM"
              />
            </div>

            <div className="invoice-info">
              <div>
                <span className="label">Book No. :</span>
                <input type="text" className="small-input" defaultValue="1" />
              </div>
              <div>
                <span className="label">Bill No. :</span>
                <input type="text" className="small-input" defaultValue="9" />
              </div>
              <div>
                <span className="label">Date :</span>
                <input
                  type="text"
                  className="small-input"
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div>
                <span className="label">Your Order No. :</span>
                <input
                  type="text"
                  className="order-input"
                  placeholder="________________"
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
              {Array.from({ length: 25 }).map((_, i) => (
                <tr key={i}>
                  <td className="sno-cell">
                    {(i + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="desc-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="Item name / specification"
                    />
                  </td>
                  <td className="qty-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="Nos / Pcs"
                    />
                  </td>
                  <td className="rate-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="amount-cell">
                    <input
                      type="text"
                      className="editable"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals-section">
            <div className="totals">
              <div className="totals-labels">
                <div>SUB TOTAL</div>
                <div>LESS / Freight</div>
                <div className="grand">G. TOTAL</div>
              </div>
              <div className="totals-values">
                <div>₹ ___________</div>
                <div>₹ ___________</div>
                <div className="grand-value">₹ ___________</div>
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
