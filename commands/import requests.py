import requests
from bs4 import BeautifulSoup
from collections import defaultdict
import re
import tkinter as tk
from tkinter import messagebox, filedialog, scrolledtext
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


class NielsenHCIAnalyzer:
    def __init__(self, url):
        self.url = url
        self.report = defaultdict(list)

    def fetch_soup(self):
        response = requests.get(self.url, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")

    def analyze(self):
        soup = self.fetch_soup()
        text = soup.get_text().lower()

        self.report["1. Visibility of System Status"].append(
            "Status indicators found." if "loading" in text else
            "No obvious system status feedback detected."
        )

        self.report["2. Match Between System and Real World"].append(
            "Technical jargon detected." if re.search(r"api|backend|exception", text)
            else "Language appears user-friendly."
        )

        self.report["3. User Control and Freedom"].append(
            "Undo/Cancel navigation found." if soup.find("a", string=re.compile("back|cancel|undo", re.I))
            else "No undo or cancel options detected."
        )

        self.report["4. Consistency and Standards"].append(
            "Standard UI components (buttons/forms) detected."
            if soup.find("button") else "Few standard UI components detected."
        )

        self.report["5. Error Prevention"].append(
            "Forms detected — input validation should be reviewed."
            if soup.find("form") else "No forms detected."
        )

        self.report["6. Recognition Rather Than Recall"].append(
            "Labels detected to aid recognition."
            if soup.find("label") else "Few labels detected."
        )

        self.report["7. Flexibility and Efficiency of Use"].append(
            "Keyboard shortcuts detected."
            if soup.find(attrs={"accesskey": True}) else "No keyboard shortcuts detected."
        )

        self.report["8. Aesthetic and Minimalist Design"].append(
            "High content density detected."
            if len(text) > 5000 else "Content density appears reasonable."
        )

        self.report["9. Error Recovery"].append(
            "Error messages detected."
            if re.search(r"error|invalid|failed", text)
            else "No visible error messages detected."
        )

        self.report["10. Help and Documentation"].append(
            "Help/FAQ links detected."
            if soup.find("a", string=re.compile("help|faq|support", re.I))
            else "No help documentation detected."
        )

        return dict(self.report)


class HCIApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Nielsen HCI Analyzer")
        self.root.geometry("800x600")

        tk.Label(root, text="Enter Website URL:", font=("Arial", 12)).pack(pady=5)
        self.url_entry = tk.Entry(root, width=80)
        self.url_entry.pack(pady=5)

        tk.Button(root, text="Analyze", command=self.run_analysis).pack(pady=5)
        tk.Button(root, text="Export to PDF", command=self.export_pdf).pack(pady=5)

        self.output = scrolledtext.ScrolledText(root, width=95, height=25)
        self.output.pack(pady=10)

        self.results = None

    def run_analysis(self):
        url = self.url_entry.get()
        if not url:
            messagebox.showerror("Error", "Please enter a URL")
            return

        try:
            analyzer = NielsenHCIAnalyzer(url)
            self.results = analyzer.analyze()
            self.output.delete("1.0", tk.END)

            for heuristic, notes in self.results.items():
                self.output.insert(tk.END, f"{heuristic}\n")
                for note in notes:
                    self.output.insert(tk.END, f"  - {note}\n")
                self.output.insert(tk.END, "\n")

        except Exception as e:
            messagebox.showerror("Error", str(e))

    def export_pdf(self):
        if not self.results:
            messagebox.showwarning("Warning", "Run analysis first")
            return

        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf")]
        )

        if not file_path:
            return

        c = canvas.Canvas(file_path, pagesize=A4)
        width, height = A4
        y = height - 40

        c.setFont("Helvetica-Bold", 14)
        c.drawString(40, y, "Nielsen HCI Heuristic Evaluation Report")
        y -= 30

        c.setFont("Helvetica", 10)
        for heuristic, notes in self.results.items():
            if y < 60:
                c.showPage()
                y = height - 40

            c.drawString(40, y, heuristic)
            y -= 15

            for note in notes:
                c.drawString(60, y, f"- {note}")
                y -= 12

            y -= 10

        c.save()
        messagebox.showinfo("Success", "PDF exported successfully!")


if __name__ == "__main__":
    root = tk.Tk()
    app = HCIApp(root)
    root.mainloop()