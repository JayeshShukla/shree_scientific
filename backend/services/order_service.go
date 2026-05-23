package services

import (
	"backend/models"
	"fmt"
	"io/ioutil"
	"log"
	"net/smtp"
	"os"
	"path/filepath"
	"time"
)

type EmailService struct {
	SMTPHost string
	SMTPPort string
	Sender   string
	Password string
}

func NewEmailService() *EmailService {
	return &EmailService{
		SMTPHost: os.Getenv("SMTP_HOST"),
		SMTPPort: os.Getenv("SMTP_PORT"),
		Sender:   os.Getenv("SMTP_SENDER"),
		Password: os.Getenv("SMTP_PASSWORD"),
	}
}

func (s *EmailService) SendQuotationEmail(order models.Order) error {
	subject := fmt.Sprintf("Quotation from Shree Scientific Center - Order #%d", order.ID)
	
	// Create HTML body
	htmlBody := fmt.Sprintf(`
		<html>
		<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
			<div style="text-align: center; border-bottom: 3px solid #9c0f0f; padding-bottom: 15px; margin-bottom: 20px;">
				<h2 style="color: #9c0f0f; margin: 0;">SHREE SCIENTIFIC CENTER</h2>
				<p style="font-size: 12px; color: #666; margin: 5px 0 0;">Chemicals • Glassware • Instruments • Lab Supplies</p>
			</div>
			
			<p>Dear School Administrator,</p>
			<p>Thank you for choosing <strong>Shree Scientific Center</strong>. We have received your order request for laboratory equipment and generated a quotation for your review.</p>
			
			<div style="background-color: #fcf8f8; padding: 15px; border-left: 4px solid #9c0f0f; margin-bottom: 20px; border-radius: 4px;">
				<h4 style="margin: 0 0 10px; color: #9c0f0f;">Quotation Summary</h4>
				<table style="width: 100%%; font-size: 13px;">
					<tr><td><strong>Bill No:</strong></td><td>SSC-%d</td></tr>
					<tr><td><strong>Date:</strong></td><td>%s</td></tr>
					<tr><td><strong>School Name:</strong></td><td>%s</td></tr>
					<tr><td><strong>City:</strong></td><td>%s</td></tr>
				</table>
			</div>
			
			<h4 style="color: #9c0f0f; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Item Specifications</h4>
			<table style="width: 100%%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
				<thead>
					<tr style="background-color: #9c0f0f; color: white;">
						<th style="padding: 8px; text-align: left;">S.No.</th>
						<th style="padding: 8px; text-align: left;">Item Description</th>
						<th style="padding: 8px; text-align: center;">Qty</th>
						<th style="padding: 8px; text-align: right;">Rate (₹)</th>
						<th style="padding: 8px; text-align: right;">Amount (₹)</th>
					</tr>
				</thead>
				<tbody>
	`, order.ID, order.CreatedAt.Format("02-01-2006"), order.SchoolName, order.SchoolCity)

	for i, item := range order.Items {
		htmlBody += fmt.Sprintf(`
			<tr style="border-bottom: 1px solid #eee;">
				<td style="padding: 8px;">%02d</td>
				<td style="padding: 8px;">%s</td>
				<td style="padding: 8px; text-align: center;">%d</td>
				<td style="padding: 8px; text-align: right;">₹%.2f</td>
				<td style="padding: 8px; text-align: right;">₹%.2f</td>
			</tr>
		`, i+1, item.ProductName, item.Quantity, item.Rate, item.Amount)
	}

	htmlBody += fmt.Sprintf(`
				</tbody>
			</table>
			
			<div style="text-align: right; font-weight: bold; margin-bottom: 20px; font-size: 14px;">
				<p style="margin: 5px 0;">Sub Total: ₹%.2f</p>
				<p style="margin: 5px 0; color: #9c0f0f; font-size: 16px;">GRAND TOTAL: ₹%.2f</p>
			</div>

			<div style="font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
				<p>This is a system-generated quotation request. Our executive will call you at %s shortly to confirm shipping details.</p>
				<p>Near Holy Home School, Prem Nagar, Balaghat - 481001 (M.P.) • Mob: 9340120216</p>
			</div>
		</body>
		</html>
	`, order.SubTotal, order.GrandTotal, order.Phone)

	// Save HTML email locally to a sent_emails folder
	emailDir := "./sent_emails"
	if err := os.MkdirAll(emailDir, 0755); err == nil {
		filename := fmt.Sprintf("quote_%d_%s.html", order.ID, time.Now().Format("20060102_150405"))
		filePath := filepath.Join(emailDir, filename)
		_ = ioutil.WriteFile(filePath, []byte(htmlBody), 0644)
		log.Printf("📥 [EMAIL SERVICE] Saved a copy of quotation email locally: %s", filePath)
	}

	// Send via SMTP if configuration variables exist
	if s.SMTPHost != "" && s.Sender != "" {
		auth := smtp.PlainAuth("", s.Sender, s.Password, s.SMTPHost)
		to := []string{order.UserEmail}
		
		msg := []byte("To: " + order.UserEmail + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-version: 1.0;\r\n" +
			"Content-Type: text/html; charset=\"UTF-8\";\r\n\r\n" +
			htmlBody)
		
		addr := fmt.Sprintf("%s:%s", s.SMTPHost, s.SMTPPort)
		err := smtp.SendMail(addr, auth, s.Sender, to, msg)
		if err != nil {
			log.Printf("⚠️ [EMAIL SERVICE] SMTP error: %v", err)
			return err
		}
		log.Printf("📧 [EMAIL SERVICE] Successfully emailed quotation to %s", order.UserEmail)
	} else {
		log.Printf("⚠️ [EMAIL SERVICE] SMTP not configured. Skipped sending email to %s (Quotation saved in ./sent_emails)", order.UserEmail)
	}

	return nil
}
