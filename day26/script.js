const qrForm = document.getElementById("qrForm");
const qrText = document.getElementById("qrText");
const qrType = document.getElementById("qrType");
const qrSize = document.getElementById("qrSize");
const qrColor = document.getElementById("qrColor");
const bgColor = document.getElementById("bgColor");

const qrContainer = document.getElementById("qrcode");
const placeholder = document.getElementById("placeholder");
const message = document.getElementById("message");

const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

let generated = false;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#d93025" : "#16834a";
}

function prepareContent() {
  const value = qrText.value.trim();

  if (!value) {
    throw new Error("Please enter content to generate a QR code.");
  }

  switch (qrType.value) {
    case "url": {
      let url = value;

      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      try {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error();
        }

        return parsed.href;
      } catch {
        throw new Error("Please enter a valid website URL.");
      }
    }

    case "email": {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(value)) {
        throw new Error("Please enter a valid email address.");
      }

      return "mailto:" + value;
    }

    case "phone": {
      const cleaned = value.replace(/[\s()-]/g, "");

      if (!/^\+?\d{7,15}$/.test(cleaned)) {
        throw new Error("Please enter a valid phone number.");
      }

      return "tel:" + cleaned;
    }

    default:
      return value;
  }
}

function resetPreview() {
  qrContainer.replaceChildren();
  placeholder.style.display = "block";

  generated = false;
  downloadBtn.disabled = true;
  copyBtn.disabled = true;
}

function generateQRCode(event) {
  event.preventDefault();

  resetPreview();

  try {
    if (typeof QRCode === "undefined") {
      throw new Error(
        "QR library unavailable. Check your internet connection."
      );
    }

    const content = prepareContent();
    const size = Number(qrSize.value);

    // Avoid colors that are too similar.
    if (
      qrColor.value.toLowerCase() ===
      bgColor.value.toLowerCase()
    ) {
      throw new Error(
        "QR code and background colors must be different."
      );
    }

    new QRCode(qrContainer, {
      text: content,
      width: size,
      height: size,
      colorDark: qrColor.value,
      colorLight: bgColor.value,
      correctLevel: QRCode.CorrectLevel.H
    });

    placeholder.style.display = "none";

    generated = true;
    downloadBtn.disabled = false;
    copyBtn.disabled = false;

    showMessage("QR Code generated successfully!");

  } catch (error) {
    resetPreview();
    showMessage(error.message, true);
  }
}

function getQRCodeCanvas() {
  if (!generated) return null;

  const canvas = qrContainer.querySelector("canvas");

  if (canvas) return canvas;

  const image = qrContainer.querySelector("img");

  if (!image || !image.complete) return null;

  const newCanvas = document.createElement("canvas");
  newCanvas.width = image.naturalWidth;
  newCanvas.height = image.naturalHeight;

  const context = newCanvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return newCanvas;
}

function downloadQRCode() {
  const canvas = getQRCodeCanvas();

  if (!canvas) {
    showMessage("QR Code is not ready yet.", true);
    return;
  }

  const link = document.createElement("a");
  link.download = "qrcraft-code.png";
  link.href = canvas.toDataURL("image/png");

  document.body.appendChild(link);
  link.click();
  link.remove();

  showMessage("QR Code downloaded successfully!");
}

async function copyQRCode() {
  const canvas = getQRCodeCanvas();

  if (!canvas) {
    showMessage("QR Code is not ready yet.", true);
    return;
  }

  try {
    if (!navigator.clipboard?.write) {
      throw new Error("Clipboard not supported.");
    }

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      throw new Error("Unable to create image.");
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob
      })
    ]);

    showMessage("QR Code copied to clipboard!");

  } catch (error) {
    showMessage(
      "Copy unavailable. Try using HTTPS or localhost.",
      true
    );
  }
}

function clearGenerator() {
  qrForm.reset();
  resetPreview();
  showMessage("");
  qrText.focus();
}

qrType.addEventListener("change", () => {
  const placeholders = {
    text: "Enter any text...",
    url: "https://example.com",
    email: "example@gmail.com",
    phone: "+2348012345678"
  };

  qrText.placeholder = placeholders[qrType.value];
});

qrForm.addEventListener("submit", generateQRCode);

downloadBtn.addEventListener("click", downloadQRCode);

copyBtn.addEventListener("click", copyQRCode);

clearBtn.addEventListener("click", clearGenerator);