import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./A4Form.css";
import logo from "./assets/conicalFlask.png";

const A4Form = () => {
  const formRef = useRef();

  const handleDownloadPDF = async () => {
    const formElement = formRef.current;

    const downloadButton = document.getElementById("download-button");
    downloadButton.style.display = "none";

    const canvas = await html2canvas(formElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    downloadButton.style.display = "block";

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("form.pdf");
  };

  return (
    <div className="a4-form-container">
      <div ref={formRef} className="a4-form">
        <div className="a4-border-box">
          <div className="header">
            <div>GSTIN : 23BQOPS2199M2ZZ</div>
            <div className="header-center">
              <div>"श्री"</div>
              <div className="quotation">Quotation</div>
            </div>
            <div className="header-right">
              <div>📞 : 9340120216</div>
              <div>📞 : 9343477532</div>
              <div>shreescientificcenter@gmail.com</div>
            </div>
          </div>

          <div className="logoContainer">
            <div>
              <img src={logo} alt="Logo" width="100" height="110" />
            </div>
            <div>
              <div className="noto-sans-gunjala-gondi-logo">
                SHREE SCIENTIFIC CENTER
              </div>
              <div className="address">
                In front of Kedar Plaza, Near Holy Home School, Prem Nagar,
                Balaghat, - 481001 (M.P.)
              </div>
              <div className="description">
                (Chemicals, Instruments, Glass wares, Fire Apparatus, Science
                Models, Sports, Scout & Redcross Material & General Order
                Suppliers )
              </div>
            </div>
          </div>

          {/* <div className="section section-green">
            <div>Left Content</div>
            <div>Right Content</div>
          </div> */}

          {/* <div>
            Dear Sir, We thank you for esteemed enquiry & have pleasure in
            quoting you as under :
          </div> */}

          {/* <table className="table-container">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Description of Item</th>
                <th>Per Unit</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(25)].map((_, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>
                    <input type="text" className="input-box" />
                  </td>
                  <td>
                    <input type="text" className="input-box" />
                  </td>
                  <td>
                    <input type="text" className="input-box" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table> */}
        </div>
      </div>

      <div className="button-container">
        <button
          id="download-button"
          onClick={handleDownloadPDF}
          className="download-button"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default A4Form;
