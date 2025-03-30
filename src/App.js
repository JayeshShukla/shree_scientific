import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        background: "black",
        padding: "20px",
      }}
    >
      <div
        ref={formRef}
        style={{
          width: "210mm",
          height: "297mm",
          background: "white",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "5mm",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "white",
            border: "2px solid #301934",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "blue",
            }}
          >
            <div style={{ textAlign: "left" }}>Left Content</div>
            <div style={{ flex: 1, textAlign: "center" }}>Center Content</div>
            <div style={{ textAlign: "right" }}>Right Content</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "yellow",
            }}
          >
            <div style={{ textAlign: "left" }}>Left Content</div>
            <div style={{ flex: 1, textAlign: "center" }}>Center Content</div>
            <div style={{ textAlign: "right" }}>Right Content</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "red",
            }}
          >
            <div style={{ textAlign: "left" }}>Left Content</div>
            <div style={{ flex: 1, textAlign: "center" }}>Center Content</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "green",
            }}
          >
            <div style={{ flex: 1 }}>Left Content</div>
            <div style={{ flex: 1 }}>Right Content</div>
          </div>

          <div>
            Dear Sir, We thank you for esteemed enquiry & have pleasure in
            quoting you as under :
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
            border="1"
          >
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>S.No</th>
                <th style={{ padding: "8px" }}>Description of Item</th>
                <th style={{ padding: "8px" }}>Per Unit</th>
                <th style={{ padding: "8px" }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(25)].map((_, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      style={{ width: "100%", outline: "none", border: "none" }}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      style={{ width: "100%", outline: "none", border: "none" }}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="text"
                      style={{ width: "100%", outline: "none", border: "none" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginLeft: "20px" }}>
        <button
          id="download-button"
          onClick={handleDownloadPDF}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default A4Form;
