// Cleaned up JavaScript for the image editor using fabric.js and jQuery
jQuery(document).ready(function ($) {
  "use strict";

  /****************************************
   * Canvas Initialization and Global Settings
   ****************************************/
  const canvas = new fabric.Canvas("wa-image-editor-canvas", {
    preserveObjectStacking: true,
  });
  canvas.enableRetinaScaling = false; // No pixel doubling

  // Global fabric object settings
  fabric.Object.prototype.cornerColor = "#8cff00";
  fabric.Object.prototype.cornerStrokeColor = "#FFFFFF";
  fabric.Object.prototype.strokeWidth = "100";
  fabric.Object.prototype.lockScalingFlip = true;
  fabric.Object.prototype.set({
    borderColor: "white",
    borderScaleFactor: 6,
  });
  fabric.Object.prototype.cornerSize = 50;
  // Use custom control handles for all objects
  fabric.Object.prototype._drawControl = controlHandles;

  function controlHandles(control, ctx, methodName, left, top) {
    if (!this.isControlVisible(control)) return;
    const size = this.cornerSize;
    ctx.beginPath();
    ctx.arc(left + size / 2, top + size / 2, size / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = "pink";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  let originalWidth = 1080;
  let originalHeight = 1080;

  // Screen Resolution Detection
  const screenWidth = window.screen.width * window.devicePixelRatio;
  const screenHeight = window.screen.height * window.devicePixelRatio;
  console.log(`Detected Screen Resolution: ${screenWidth}x${screenHeight}`);
  console.log(`Device Pixel Ratio: ${window.devicePixelRatio}`);

  if (screenWidth >= 3840 && screenHeight >= 2160) {
    console.log("✅ This is a 4K screen. Applying 4K settings.");
  } else {
    console.log("❌ This is smaller than 4K. Applying smaller settings.");
  }

  // Mode configurations
  const modes = {
    Instapost: {
      width: 1080,
      height: 1080,
      bg: "material/images/Backgrounds/universal/universal 3.png",
      defaultZoom: 0.65,
      defaultPanX: 0,
      defaultPanY: -320,
    },
    portrait: {
      width: 3508,
      height: 4960,
      bg: "material/images/Backgrounds/universal/universal 3.png",
      defaultZoom: 0.14,
      defaultPanX: -1200,
      defaultPanY: -2260,
    },
    landscape: {
      width: 4960,
      height: 3508,
      bg: "material/images/Backgrounds/universal/universal 3.png",
      defaultZoom: 0.2,
      defaultPanX: -1900,
      defaultPanY: -1530,
    },
  };

  // Adjust settings for non-4K screens
  if (screenWidth < 3840 && screenHeight < 2160) {
    modes.Instapost.defaultZoom = 0.7;
    modes.Instapost.defaultPanX = 20;
    modes.Instapost.defaultPanY = -250;

    modes.portrait.defaultZoom = 0.16;
    modes.portrait.defaultPanX = -1189;
    modes.portrait.defaultPanY = -2206;

    modes.landscape.defaultZoom = 0.23;
    modes.landscape.defaultPanX = -1912;
    modes.landscape.defaultPanY = -1481;
  }

  // Mode settings for text positioning and sizes
  const modeSettings = {
    Instapost: {
      demoTitle: {
        left: 60,
        top: 50,
        fontSize: 120,
        strokeWidth: 2,
        shadowBlur: 20,
        textAlign: "center",
        maxWidth: 1080,
      },
      demoDescription: {
        left: 50,
        top: 280,
        fontSize: 80,
        strokeWidth: 1,
        shadowBlur: 15,
        textAlign: "left",
      },
      demoDate: {
        left: 0,
        top: 680,
        fontSize: 160,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "center",
      },
      demoTime: {
        left: 30,
        top: 900,
        fontSize: 60,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "right",
      },
      demoStart: {
        left: 30,
        top: 970,
        fontSize: 60,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "right",
      },
      demoStreet: {
        left: 0,
        top: 950,
        fontSize: 50,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "left",
      },
      demoPlace: {
        left: 20,
        top: 850,
        fontSize: 80,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "left",
      },
      bandLogo: { left: 650, top: 450, maxWidth: 350, maxHeight: 250 },
    },
    portrait: {
      demoTitle: {
        left: 2160 / 2, 
        top: 50,
        fontSize: 520,
        strokeWidth: 2,
        shadowBlur: 20,
        textAlign: "center",
        maxWidth: 2160 - 100, // example: full width minus 50px margin on each side
      },
      demoDescription: {
        left: 150,
        top: 1500,
        fontSize: 250,
        strokeWidth: 1,
        shadowBlur: 15,
        textAlign: "left",
        maxWidth: 2160 - 300,
      },
      demoDate: {
        left: 2160 / 2, // centered at 1080
        top: 2820,
        fontSize: 650,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "center",
        maxWidth: 2160 - 100,
      },
      demoTime: {
        left: 2200,
        top: 3350,
        fontSize: 370,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "right",
        maxWidth: 1000,
      },
      demoStart: {
        left: 600,
        top: 3350,
        fontSize: 370,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "right",
        maxWidth: 1000,
      },
      demoStreet: {
        left: 2160 / 2, 
        top: 4350,
        fontSize: 250,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "center",
        maxWidth: 2160 - 200,
      },
      demoPlace: {
        left: 2160 / 2, 
        top: 4080,
        fontSize: 300,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "center",
        maxWidth: 2160 - 200,
      },
      bandLogo: { left: 1900, top: 1500, maxWidth: 1500, maxHeight: 1500 },
    },
    landscape: {
      demoTitle: {
        left: 3840 / 2, // 1920 for a 3840px wide canvas
        top: 50,
        fontSize: 450,
        strokeWidth: 2,
        shadowBlur: 20,
        textAlign: "center",
        maxWidth: 3840 - 100,
      },
      demoDescription: {
        left: 100,
        top: 1000,
        fontSize: 200,
        strokeWidth: 1,
        shadowBlur: 15,
        textAlign: "left",
        maxWidth: 3840 - 500,
      },
      demoDate: {
        left: 3840 / 2, // centered at 1920
        top: 2200,
        fontSize: 500,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "center",
        maxWidth: 3840 - 100,
      },
      demoTime: {
        left: 900,
        top: 2700,
        fontSize: 300,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "right",
        maxWidth: 1000,
      },
      demoStart: {
        left: 100,
        top: 2700,
        fontSize: 300,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "right",
        maxWidth: 1000,
      },
      demoStreet: {
        left: 100,
        top: 2900,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "left",
        maxWidth: 3840 - 200,
      },
      demoPlace: {
        left: 100,
        top: 2600,
        fontSize: 250,
        strokeWidth: 1.5,
        shadowBlur: 15,
        textAlign: "left",
        maxWidth: 3840 - 200,
      },
      bandLogo: {
        left: 3300, 
        top: 1100,
        maxWidth: 1500,
        maxHeight: 1500,
      },
    },
  };
  

  /****************************************
   * Canvas Transformations (Zoom & Pan)
   ****************************************/
  function updateTransform() {
    const scale = parseFloat($("#zoom-range").val());
    const panX = parseFloat($("#pan-x").val());
    const panY = parseFloat($("#pan-y").val());
    const container = canvas.getElement().parentNode;
    container.style.transformOrigin = "center";
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  // Mouse wheel zoom
  canvas.on("mouse:wheel", function (opt) {
    let scale = parseFloat($("#zoom-range").val());
    const delta = opt.e.deltaY > 0 ? -0.02 : 0.02;
    scale = Math.min(Math.max(scale + delta, 0.02), 3);
    $("#zoom-range").val(scale.toFixed(2));
    updateTransform();
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // Keyboard arrow keys for panning
  document.addEventListener("keydown", function (e) {
    let panX = parseFloat($("#pan-x").val());
    let panY = parseFloat($("#pan-y").val());
    const step = 10;
    switch (e.key) {
      case "ArrowUp":
        panY -= step;
        break;
      case "ArrowDown":
        panY += step;
        break;
      case "ArrowLeft":
        panX -= step;
        break;
      case "ArrowRight":
        panX += step;
        break;
      default:
        return;
    }
    $("#pan-x").val(panX.toFixed(0));
    $("#pan-y").val(panY.toFixed(0));
    updateTransform();
    e.preventDefault();
  });

  // Middle mouse button panning
  let isPanning = false;
  let lastMousePos = { x: 0, y: 0 };
  document.addEventListener("mousedown", function (e) {
    if (e.button === 1) {
      isPanning = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
      canvas.skipTargetFind = true;
      canvas.selection = false;
      e.preventDefault();
    }
  });
  document.addEventListener("mousemove", function (e) {
    if (isPanning) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      let panX = parseFloat($("#pan-x").val()) + deltaX;
      let panY = parseFloat($("#pan-y").val()) + deltaY;
      $("#pan-x").val(panX.toFixed(0));
      $("#pan-y").val(panY.toFixed(0));
      updateTransform();
      lastMousePos = { x: e.clientX, y: e.clientY };
    }
  });
  document.addEventListener("mouseup", function (e) {
    if (isPanning && e.button === 1) {
      isPanning = false;
      canvas.skipTargetFind = false;
      canvas.selection = true;
    }
  });

  /****************************************
   * Asset Loading and JSON Import
   ****************************************/
  function loadAssetsFromJSON(jsonPath) {
    fetch(jsonPath)
      .then((response) => response.json())
      .then((data) => populateAssets(data))
      .catch((error) => console.error("Error loading assets JSON:", error));
  }

  function populateAssets(data) {
    const container = $("#assets-container");
    container.empty();

    Object.entries(data).forEach(([category, content]) => {
      const categorySection = $(`
        <div>
          <h3 class="collapsible">${category}</h3>
          <ul class="content"></ul>
        </div>
      `);
      const categoryContent = categorySection.find("ul.content");

      if (content.root) {
        content.root.forEach((asset) => {
          const $newAsset = $(`
            <li>
              <img src="${asset.file}" alt="${asset.name}" width="100" />
            </li>
          `);
          if (category === "Backgrounds") {
            $newAsset.click(() => setBackground(asset.file));
          } else {
            $newAsset.click(() => handleAssetClick($newAsset, asset.file));
          }
          categoryContent.append($newAsset);
        });
      }

      Object.entries(content).forEach(([subCategory, subContent]) => {
        if (subCategory === "root") return;
        const subCategorySection = $(`
          <div>
            <h4 class="collapsible">${subCategory}</h4>
            <ul class="content"></ul>
          </div>
        `);
        const subCategoryContent = subCategorySection.find("ul.content");
        subContent.forEach((asset) => {
          const $newAsset = $(`
            <li>
              <img src="${asset.file}" alt="${asset.name}" width="100" />
            </li>
          `);
          if (category === "Backgrounds") {
            $newAsset.click(() => setBackground(asset.file));
          } else {
            $newAsset.click(() => handleAssetClick($newAsset, asset.file));
          }
          subCategoryContent.append($newAsset);
        });
        categoryContent.append(subCategorySection);
      });

      container.append(categorySection);
    });
    initializeCollapsibles();
  }

  function initializeCollapsibles() {
    document.querySelectorAll(".collapsible").forEach(function (collapsible) {
      collapsible.addEventListener("click", function () {
        collapsible.classList.toggle("active");
        const content = collapsible.nextElementSibling;
        if (content && content.classList.contains("content")) {
          content.classList.toggle("active");
          content.style.display = content.classList.contains("active")
            ? "block"
            : "none";
        }
      });
    });
  }

  loadAssetsFromJSON("./assets.json");

  function setBackground(imageUrl) {
    fabric.Image.fromURL(imageUrl, function (img) {
      img.set({
        width: originalWidth,
        height: originalHeight,
        originX: "left",
        originY: "top",
      });
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  }

  function setCanvasMode(mode) {
    const info = modes[mode];
    if (!info) {
      console.error(`Mode "${mode}" is not defined.`);
      return;
    }
    originalWidth = info.width;
    originalHeight = info.height;
    canvas.setWidth(originalWidth);
    canvas.setHeight(originalHeight);
    fabric.Image.fromURL(info.bg, function (img) {
      img.set({
        width: originalWidth,
        height: originalHeight,
        originX: "left",
        originY: "top",
      });
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
    $("#zoom-range").val(info.defaultZoom);
    $("#pan-x").val(info.defaultPanX);
    $("#pan-y").val(info.defaultPanY);
    updateTransform();
  }

  $(".canvas-symbol").click(function () {
    const mode = $(this).data("id");
    $(".canvas-symbol").removeClass("canvas-symbol-active");
    $(this).addClass("canvas-symbol-active");
    setCanvasMode(mode);
  });

  // Trigger default mode
  setCanvasMode("Instapost");

  // Update transform when inputs change
  $("#zoom-range").on("input", updateTransform);
  $("#pan-x,#pan-y").on("input change", updateTransform);

  // Export canvas as PNG
  $("#export-png").click(function () {
    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "export.png";
    link.click();
  });

  // Background upload
  $("#upload-bg-btn").click(() => $("#background-upload").click());
  $("#background-upload").on("change", function (e) {
    const input = e.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataURL = e.target.result;
        fabric.Image.fromURL(dataURL, function (img) {
          img.set({
            width: originalWidth,
            height: originalHeight,
            originX: "left",
            originY: "top",
          });
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        });
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  // Asset upload
  $("#upload-asset-btn").click(() => $("#asset-upload").click());
  $("#asset-upload").on("change", function (e) {
    const input = e.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataURL = e.target.result;
        const $newAsset = $(
          `<li><img src="${dataURL}" alt="uploaded asset" width="100" height="100"></li>`
        );
        $(".assets").append($newAsset);
        $newAsset.click(() => handleAssetClick($newAsset, dataURL));
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  function handleAssetClick($asset, src) {
    let imageObj = $asset.data("wa-image-image-obj");
    if (!imageObj) {
      fabric.Image.fromURL(src, function (img) {
        img.set({ left: 50, top: 50, scaleX: 0.5, scaleY: 0.5 });
        canvas.add(img).setActiveObject(img);
        $asset.data("wa-image-image-obj", img).addClass("selected");
      });
    } else {
      canvas.remove(imageObj);
      $asset.removeData("wa-image-image-obj").removeClass("selected");
    }
  }

  /****************************************
   * Text and Event Details Handling
   ****************************************/
  $("#add-text-btn").click(function () {
    const textInput = $("#text-input").val();
    const textColor = $("#apply-color2").is(":checked")
      ? $("#text-color-picker2").val()
      : "#000000";
    const outlineColor = $("#apply-outline2").is(":checked")
      ? $("#text-outline-picker2").val()
      : null;
    const outlineSize = $("#apply-outline2").is(":checked")
      ? parseFloat($("#outline-size-slider").val())
      : 0;
    const glowSize = $("#apply-glow2").is(":checked")
      ? parseFloat($("#glow-size-slider").val())
      : 0;
    const glowColor = $("#apply-glow2").is(":checked")
      ? $("#text-glow-picker2").val()
      : null;
    const selectedFont = $("#additional-text-font").val() || "Arial";
    const textAlign = $("#text-align").val();
    const isBold = $("#text-bold").is(":checked");
    const isItalic = $("#text-italic").is(":checked");
    const isUnderline = $("#text-underline").is(":checked");
    const isStrikethrough = $("#text-strikethrough").is(":checked");

    if (textInput.trim() !== "") {
      const text = new fabric.Text(textInput, {
        left: 100,
        top: 100,
        fill: textColor,
        fontSize: 80,
        fontFamily: selectedFont,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        underline: isUnderline,
        linethrough: isStrikethrough,
        textAlign: textAlign,
        stroke: outlineColor || null,
        strokeWidth: outlineSize,
        objectCaching: false,
        shadow: glowColor
          ? new fabric.Shadow({
              color: glowColor,
              blur: glowSize,
              offsetX: 0,
              offsetY: 0,
            })
          : null,
      });
      canvas.add(text).setActiveObject(text);
      text.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,
        tl: true,
        tr: true,
        bl: true,
        br: true,
        mtr: true,
      });
    } else {
      alert("Please enter some text!");
    }
  });

  document.getElementById("add-event-details").addEventListener("click", function () {
    const activeSection = document.querySelector(".form-section:not([style*='display: none'])");
    let details = {};
  
    if (activeSection.classList.contains("Demo")) {
      details = {
        title: activeSection.querySelector("#demo-title")?.value || "",
        description: activeSection.querySelector("#demo-description")?.value || "",
        date: activeSection.querySelector("#demo-date")?.value || "",
        time: activeSection.querySelector("#demo-time")?.value || "",
        start: activeSection.querySelector("#demo-start")?.value || "",
        place: activeSection.querySelector("#demo-place")?.value || "",
        street:
          activeSection.querySelector("#event-place")?.dataset.selectedAddress ||
          activeSection.querySelector("#event-place")?.value ||
          "",
        image: activeSection.querySelector("#demo-image-upload")?.files[0] || null,
      };
    }
    console.log("Collected Demo Details:", details);
  
    const currentMode = document.querySelector(".canvas-symbol-active")?.dataset.id || "Instapost";
    const settings = modeSettings[currentMode];
  
    const formatDateToGerman = (dateString) => {
      if (!dateString) return "";
      const [year, month, day] = dateString.split("-");
      return `${day}.${month}.${year}`;
    };
  
    if (details.date) {
      details.date = formatDateToGerman(details.date);
    }
  
    const addText = (txt, opts) => {
      if (!txt || !opts) return;
      const sideMargin = 50; // fixed margin for print safety
      const canvasWidth = canvas.getWidth();
      const usableWidth = canvasWidth - 2 * sideMargin;
  
      // Limit the textbox width to the usable area.
      const textBox = new fabric.Textbox(txt, {
        left: opts.left, // temporary value, will be re-adjusted below
        top: opts.top,
        width: Math.min(opts.maxWidth || 1080, usableWidth),
        fontSize: opts.fontSize || 80,
        fill: "#FFFFFF",
        fontFamily: document.getElementById("font-picker")?.value || "Arial",
        stroke: document.getElementById("apply-outline").checked
          ? document.getElementById("text-outline-picker")?.value
          : null,
        strokeWidth: document.getElementById("apply-outline").checked
          ? parseFloat(document.getElementById("outline-size-slider")?.value)
          : 0,
        shadow: document.getElementById("apply-glow").checked
          ? new fabric.Shadow({
              color: document.getElementById("text-glow-picker")?.value,
              blur: parseFloat(document.getElementById("glow-size-slider")?.value),
            })
          : null,
        lineHeight: 0.8,
        textAlign: opts.textAlign || "left",
      });
  
      // Adjust left positioning using the safe margins:
      if (opts.textAlign === "center") {
        // Center the text within the entire canvas.
        textBox.set({ left: canvasWidth / 2 - textBox.width / 2 });
      } else if (opts.textAlign === "right") {
        // For right alignment, opts.left represents the gap from the right edge.
        textBox.set({ left: canvasWidth - opts.left - textBox.width });
      } else {
        // For left alignment, ensure a minimum gap from the left edge.
        textBox.set({ left: Math.max(opts.left, sideMargin) });
      }
      
      canvas.add(textBox);
    };
  
    const addImage = (file, opts) => {
      if (!opts || !file) return;
      const sideMargin = 50; // fixed margin for print safety
      const canvasWidth = canvas.getWidth();
      const usableWidth = canvasWidth - 2 * sideMargin;
  
      const reader = new FileReader();
      reader.onload = function (e) {
        fabric.Image.fromURL(e.target.result, function (img) {
          const originalWidth = img.width;
          const originalHeight = img.height;
          let newWidth, newHeight;
          const aspectRatio = originalWidth / originalHeight;
  
          if (originalWidth > originalHeight) {
            if (opts.maxWidth) {
              // Ensure the new width does not exceed the usable width.
              newWidth = Math.min(opts.maxWidth, usableWidth);
              newHeight = newWidth / aspectRatio;
            }
          } else if (originalHeight > originalWidth) {
            if (opts.maxHeight) {
              newHeight = opts.maxHeight;
              newWidth = newHeight * aspectRatio;
              newWidth = Math.min(newWidth, usableWidth);
            }
          } else {
            if (opts.maxWidth && opts.maxHeight) {
              const minSize = Math.min(opts.maxWidth, opts.maxHeight, usableWidth);
              newWidth = minSize;
              newHeight = minSize;
            }
          }
  
          // Position the image ensuring the left margin is maintained.
          img.set({
            left: Math.max(opts.left, sideMargin),
            top: opts.top,
            width: newWidth,
            height: newHeight,
          });
          canvas.add(img);
          canvas.sendToBack(img);
        });
      };
      reader.readAsDataURL(file);
    };
  
    // Format street address without printing "undefined" for missing parts.
    if (details.street) {
      const addressParts = details.street.split(", ");
      let formattedAddress;
      if (addressParts.length >= 4) {
        const firstLine = [addressParts[0], addressParts[1]]
          .filter(part => part && part.trim())
          .join(" ");
        const secondLine = [addressParts[4], addressParts[3]]
          .filter(part => part && part.trim())
          .join(" ") + (addressParts[2] && addressParts[2].trim() ? "-" + addressParts[2] : "");
        formattedAddress = firstLine + "\n" + secondLine;
      } else {
        formattedAddress = details.street.replace(/, /g, "\n");
      }
      console.log("Formatted Address for Canvas:", formattedAddress);
      addText(formattedAddress, settings.demoStreet);
    }
    if (details.place) {
      addText(details.place, settings.demoPlace);
    }
    if (details.image && settings.bandLogo) {
      addImage(details.image, settings.bandLogo);
    }
    if (details.title) addText(details.title, settings.demoTitle);
    if (details.description) addText(details.description, settings.demoDescription);
    if (details.date) addText(details.date, settings.demoDate);
    if (details.time) addText(`Meetup: ${details.time}`, settings.demoTime);
    if (details.start) addText(`Start: ${details.start}`, settings.demoStart);
  
    canvas.renderAll();
  });
  
  
  

  /****************************************
   * Load Regular Fonts from JSON
   ****************************************/
  function loadRegularFonts() {
    console.log("Loading fonts from JSON...");
    $.getJSON("./fonts.json", function (data) {
      const styleElement = document.createElement("style");
      document.head.appendChild(styleElement);
      const fontPromises = [];

      // Standards fonts
      if (data.Standards && data.Standards.root) {
        const standardGroup1 = $('<optgroup label="Standards"></optgroup>');
        const standardGroup2 = $('<optgroup label="Standards"></optgroup>');
        data.Standards.root.forEach((fontEntry) => {
          if (fontEntry.name && fontEntry.file) {
            styleElement.sheet.insertRule(`
              @font-face {
                font-family: '${fontEntry.name}';
                src: url('${fontEntry.file}') format('truetype');
              }
            `, styleElement.sheet.cssRules.length);
            const optionHTML = `<option value="${fontEntry.name}" style="font-family:'${fontEntry.name}', sans-serif;">${fontEntry.name}</option>`;
            standardGroup1.append(optionHTML);
            standardGroup2.append(optionHTML);
            const font = new FontFace(fontEntry.name, `url('${fontEntry.file}')`);
            fontPromises.push(font.load());
            document.fonts.add(font);
          }
        });
        $("#font-picker").append(standardGroup1);
        $("#additional-text-font").append(standardGroup2);
      } else {
        console.warn("No 'Standards' fonts found in JSON.");
      }

      // Other font categories
      for (const category in data) {
        if (category !== "Standards" && data[category].root) {
          const group1 = $(`<optgroup label="${category}"></optgroup>`);
          const group2 = $(`<optgroup label="${category}"></optgroup>`);
          data[category].root.forEach((fontEntry) => {
            if (fontEntry.name && fontEntry.file) {
              styleElement.sheet.insertRule(`
                @font-face {
                  font-family: '${fontEntry.name}';
                  src: url('${fontEntry.file}') format('truetype');
                }
              `, styleElement.sheet.cssRules.length);
              const optionHTML = `<option value="${fontEntry.name}" style="font-family:'${fontEntry.name}', sans-serif;">${fontEntry.name}</option>`;
              group1.append(optionHTML);
              group2.append(optionHTML);
              const font = new FontFace(fontEntry.name, `url('${fontEntry.file}')`);
              fontPromises.push(font.load());
              document.fonts.add(font);
            }
          });
          $("#font-picker").append(group1);
          $("#additional-text-font").append(group2);
        }
      }

      // Hardcoded regular fonts
      const regularGroup1 = $('<optgroup label="Regular Fonts"></optgroup>');
      const regularGroup2 = $('<optgroup label="Regular Fonts"></optgroup>');
      const regularFonts = [
        "Arial", "Verdana", "Times New Roman", "Georgia", "Courier New",
        "Tahoma", "Trebuchet MS", "Lucida Console", "Impact", "Comic Sans MS",
      ];
      regularFonts.forEach((font) => {
        const optionHTML = `<option value="${font}" style="font-family:'${font}', sans-serif;">${font}</option>`;
        regularGroup1.append(optionHTML);
        regularGroup2.append(optionHTML);
      });
      $("#font-picker").append(regularGroup1);
      $("#additional-text-font").append(regularGroup2);

      Promise.all(fontPromises)
        .then(() => {
          console.log("All fonts loaded and applied.");
        })
        .catch((err) => {
          console.error("Error loading fonts:", err);
        });
    }).fail(function (error) {
      console.error("Failed to load fonts JSON.", error);
    });
  }

  loadRegularFonts();

  /****************************************
   * Canvas Object Manipulation (Opacity, SVG Colors)
   ****************************************/
  $("#opacity-slider").on("input change", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const opacityValue = parseFloat($(this).val());
      activeObject.set("opacity", opacityValue);
      canvas.renderAll();
    }
  });

  $("#svg-color-picker").on("input change", function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    const newColor = $(this).val();
    if (activeObject.type === "image") {
      const r = parseInt(newColor.substr(1, 2), 16);
      const g = parseInt(newColor.substr(3, 2), 16);
      const b = parseInt(newColor.substr(5, 2), 16);
      activeObject.filters = [];
      activeObject.filters.push(
        new fabric.Image.filters.ColorMatrix({
          matrix: [0, 0, 0, 0, r, 0, 0, 0, 0, g, 0, 0, 0, 0, b, 0, 0, 0, 1, 0],
        })
      );
      activeObject.applyFilters();
      canvas.renderAll();
    } else if (activeObject.type === "group") {
      activeObject.forEachObject((obj) => {
        obj.set("fill", newColor);
      });
      canvas.renderAll();
    }
  });

  /****************************************
   * Edit, Delete, and Layer Control Icons
   ****************************************/
  // Create and position edit icon for text objects
  let editIcon = document.createElement("div");
  editIcon.innerHTML = "🖊️";
  editIcon.style.position = "fixed";
  editIcon.style.width = "24px";
  editIcon.style.height = "24px";
  editIcon.style.fontSize = "36px";
  editIcon.style.cursor = "pointer";
  editIcon.style.display = "none";
  editIcon.style.zIndex = "1000";
  editIcon.style.left = "59%";
  editIcon.style.top = "8%";
  document.body.appendChild(editIcon);

  function showEditIcon(target) {
    if (!target || !target.oCoords) return;
    editIcon.style.display = "block";
  }

  canvas.on("selection:created", function (e) {
    const selectedObjects = e.selected || [];
    if (
      selectedObjects.length === 1 &&
      (selectedObjects[0].type === "textbox" || selectedObjects[0].type === "text")
    ) {
      showEditIcon(selectedObjects[0]);
    } else {
      editIcon.style.display = "none";
    }
  });

  canvas.on("selection:cleared", function () {
    editIcon.style.display = "none";
  });

  editIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === "textbox" || activeObject.type === "text")) {
      const originalText = activeObject.text;
      const textarea = document.createElement("textarea");
      textarea.value = originalText;
      textarea.style.position = "fixed";
      textarea.style.left = "59%";
      textarea.style.top = "10%";
      textarea.style.width = "200px";
      textarea.style.height = "50px";
      textarea.style.fontSize = "1em";
      textarea.style.fontFamily = "Arial, sans-serif";
      textarea.style.color = "black";
      textarea.style.background = "rgba(255, 255, 255, 0.9)";
      textarea.style.border = "1px solid #ccc";
      textarea.style.padding = "5px";
      textarea.style.zIndex = "1001";
      textarea.style.overflow = "hidden";
      textarea.style.resize = "none";
      textarea.style.whiteSpace = "pre-wrap";
      document.body.appendChild(textarea);
      textarea.focus();

      textarea.addEventListener("blur", function () {
        const newText = textarea.value.trim();
        if (newText) {
          activeObject.text = newText;
          canvas.renderAll();
        }
        document.body.removeChild(textarea);
        editIcon.style.display = "none";
      });

      textarea.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
          textarea.blur();
        }
      });
    }
  });

  canvas.on("object:selected", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === "textbox" || activeObject.type === "text")) {
      showEditIcon(activeObject);
    }
  });

  // Delete, Move Up, Move Down, and Lock icons
  let deleteIcon = document.createElement("div");
  deleteIcon.innerHTML = "🗑️";
  deleteIcon.style.position = "fixed";
  deleteIcon.style.width = "24px";
  deleteIcon.style.height = "24px";
  deleteIcon.style.fontSize = "36px";
  deleteIcon.style.cursor = "pointer";
  deleteIcon.style.display = "none";
  deleteIcon.style.zIndex = "1000";
  document.body.appendChild(deleteIcon);

  let moveUpIcon = document.createElement("div");
  moveUpIcon.innerHTML = "⬆️";
  moveUpIcon.style.position = "fixed";
  moveUpIcon.style.width = "24px";
  moveUpIcon.style.height = "24px";
  moveUpIcon.style.fontSize = "36px";
  moveUpIcon.style.cursor = "pointer";
  moveUpIcon.style.display = "none";
  moveUpIcon.style.zIndex = "1000";
  document.body.appendChild(moveUpIcon);

  let moveDownIcon = document.createElement("div");
  moveDownIcon.innerHTML = "⬇️";
  moveDownIcon.style.position = "fixed";
  moveDownIcon.style.width = "24px";
  moveDownIcon.style.height = "24px";
  moveDownIcon.style.fontSize = "36px";
  moveDownIcon.style.cursor = "pointer";
  moveDownIcon.style.display = "none";
  moveDownIcon.style.zIndex = "1000";
  document.body.appendChild(moveDownIcon);

  let lockIcon = document.createElement("div");
  lockIcon.innerHTML = "🔓";
  lockIcon.style.position = "fixed";
  lockIcon.style.width = "24px";
  lockIcon.style.height = "24px";
  lockIcon.style.fontSize = "36px";
  lockIcon.style.cursor = "pointer";
  lockIcon.style.display = "none";
  lockIcon.style.zIndex = "1000";
  document.body.appendChild(lockIcon);

  // Position icons near each other
  function positionIcons(target) {
    if (!target || !target.oCoords) return;
    deleteIcon.style.left = "63%";
    deleteIcon.style.top = "8%";
    deleteIcon.style.display = "block";
    moveUpIcon.style.left = "66%";
    moveUpIcon.style.top = "8%";
    moveUpIcon.style.display = "block";
    moveDownIcon.style.left = "69%";
    moveDownIcon.style.top = "8%";
    moveDownIcon.style.display = "block";
    lockIcon.style.left = "72%";
    lockIcon.style.top = "8%";
    lockIcon.style.display = "block";
    if (
      target.lockMovementX &&
      target.lockMovementY &&
      target.lockScalingX &&
      target.lockScalingY &&
      target.lockRotation
    ) {
      lockIcon.innerHTML = "🔒";
    } else {
      lockIcon.innerHTML = "🔓";
    }
  }

  deleteIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === "activeSelection") {
        activeObject.forEachObject((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
      } else {
        canvas.remove(activeObject);
      }
      canvas.renderAll();
      hideIcons();
    }
  });

  moveUpIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringForward(activeObject);
      canvas.renderAll();
    }
  });

  moveDownIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendBackwards(activeObject);
      canvas.renderAll();
    }
  });

  lockIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (
        activeObject.lockMovementX &&
        activeObject.lockMovementY &&
        activeObject.lockScalingX &&
        activeObject.lockScalingY &&
        activeObject.lockRotation
      ) {
        activeObject.lockMovementX = false;
        activeObject.lockMovementY = false;
        activeObject.lockScalingX = false;
        activeObject.lockScalingY = false;
        activeObject.lockRotation = false;
        lockIcon.innerHTML = "🔓";
      } else {
        activeObject.lockMovementX = true;
        activeObject.lockMovementY = true;
        activeObject.lockScalingX = true;
        activeObject.lockScalingY = true;
        activeObject.lockRotation = true;
        lockIcon.innerHTML = "🔒";
      }
      canvas.renderAll();
    }
  });

  canvas.on("object:selected", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      positionIcons(activeObject);
    }
  });

  canvas.on("selection:cleared", function () {
    hideIcons();
  });

  function hideIcons() {
    deleteIcon.style.display = "none";
    moveUpIcon.style.display = "none";
    moveDownIcon.style.display = "none";
    lockIcon.style.display = "none";
  }

  /****************************************
   * Drawing Mode and Brush Settings
   ****************************************/
  const colorPicker = document.getElementById("color-picker");
  const sizeSlider = document.getElementById("size-slider");
  const toggleDrawing = document.getElementById("toggle-drawing");
  canvas.isDrawingMode = false;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  updateBrushSettings();

  function updateBrushSettings() {
    if (!canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.color = colorPicker.value;
    canvas.freeDrawingBrush.width = parseInt(sizeSlider.value, 10);
    canvas.freeDrawingBrush.decimate = 2;
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 5,
      color: colorPicker.value,
      offsetX: 0,
      offsetY: 0,
    });
  }

  colorPicker.addEventListener("input", updateBrushSettings);
  sizeSlider.addEventListener("input", updateBrushSettings);
  toggleDrawing.addEventListener("click", function () {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    toggleDrawing.textContent = canvas.isDrawingMode ? "Stop drawing" : "Start drawing";
  });

  /****************************************
   * Save and Load User Placements
   ****************************************/
  const saveUserPlacements = () => {
    const currentMode = document.querySelector(".canvas-symbol-active")?.dataset.id || "Instapost";
    let elements = {};
    const canvasBg = {
      type: canvas.backgroundImage ? "image" : "color",
      value: canvas.backgroundImage ? canvas.backgroundImage._element?.src : canvas.backgroundColor,
    };
    canvas.getObjects().forEach((obj) => {
      let elementName = obj.text || obj._element?.alt || `Element_${Object.keys(elements).length + 1}`;
      elements[elementName] = {
        type: obj.type,
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
        mode: currentMode,
      };
      if (obj.type === "text") {
        elements[elementName] = {
          ...elements[elementName],
          text: obj.text,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily || "Arial",
          strokeWidth: obj.strokeWidth || 0,
          strokeColor: obj.stroke || "none",
          fill: obj.fill || "#FFFFFF",
          shadowBlur: obj.shadow?.blur || 0,
          shadowColor: obj.shadow?.color || "none",
        };
      } else if (obj.type === "image") {
        elements[elementName].src = obj._element?.src;
      }
    });
    const jsonData = JSON.stringify({ mode: currentMode, background: canvasBg, elements }, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `user_placements_${currentMode}.json`;
    link.click();
  };

  const loadUserPlacements = (file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = JSON.parse(e.target.result);
      canvas.clear();
      if (data.background?.type === "image") {
        fabric.Image.fromURL(data.background.value, function (img) {
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        });
      } else {
        canvas.setBackgroundColor(data.background?.value || "#000000", canvas.renderAll.bind(canvas));
      }
      Object.entries(data.elements).forEach(([name, obj]) => {
        if (obj.type === "text") {
          const textEl = new fabric.Text(obj.text, {
            left: obj.left,
            top: obj.top,
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily || "Arial",
            stroke: obj.strokeColor !== "none" ? obj.strokeColor : null,
            strokeWidth: obj.strokeWidth || 0,
            shadow: obj.shadowBlur > 0
              ? new fabric.Shadow({ blur: obj.shadowBlur, color: obj.shadowColor })
              : null,
            fill: obj.fill || "#FFFFFF",
          });
          textEl.set({ name });
          canvas.add(textEl);
        } else if (obj.type === "image") {
          fabric.Image.fromURL(obj.src, function (img) {
            img.set({
              left: obj.left,
              top: obj.top,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
            });
            img.set({ name });
            canvas.add(img);
          });
        }
      });
      canvas.renderAll();
      console.log("User placements imported!");
    };
    reader.readAsText(file);
  };

  document.getElementById("import-placements").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      loadUserPlacements(file);
    }
  });
  document.getElementById("save-placements").addEventListener("click", saveUserPlacements);

  /****************************************
   * Additional UI Interactions (Modals, Address Suggestions, Mode Selector)
   ****************************************/
  // Help Modal
  const openHelp = document.getElementById("open-help");
  const helpOverlay = document.getElementById("help-overlay");
  const helpModal = document.getElementById("help-modal");
  const closeHelp = document.getElementById("close-help");
  openHelp.addEventListener("click", function () {
    helpOverlay.style.display = "flex";
  });
  closeHelp.addEventListener("click", function () {
    helpOverlay.style.display = "none";
  });
  helpOverlay.addEventListener("click", function (event) {
    if (event.target === helpOverlay) {
      helpOverlay.style.display = "none";
    }
  });

  // Event Modal
  const modal = document.getElementById("event-modal");
  const openModal = document.getElementById("open-modal");
  const closeModal = document.querySelector(".close");
  openModal.addEventListener("click", () => {
    modal.style.display = "flex";
  });
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Address Suggestions for Event Place
  const addressInput = document.getElementById("event-place");
  const suggestionBox = document.getElementById("address-suggestions");
  addressInput.addEventListener("input", function () {
    let query = addressInput.value.trim();
    if (query.length < 3) {
      suggestionBox.innerHTML = "";
      return;
    }
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
      .then(response => response.json())
      .then(data => {
        suggestionBox.innerHTML = "";
        data.forEach(place => {
          let li = document.createElement("li");
          const address = place.address;
          const formattedAddress = [
            address.road || "",
            address.house_number || "",
            address.suburb || address.district || "",
            address.city || address.town || address.village || "",
            address.postcode || "",
          ]
            .filter(Boolean)
            .join(", ");
          li.textContent = `Address: ${formattedAddress}`;
          li.style.padding = "5px";
          li.style.cursor = "pointer";
          li.addEventListener("click", function () {
            addressInput.value = formattedAddress;
            addressInput.dataset.selectedAddress = formattedAddress;
            suggestionBox.innerHTML = "";
          });
          suggestionBox.appendChild(li);
        });
      })
      .catch(error => console.error("Error fetching location data:", error));
  });
  document.addEventListener("click", function (e) {
    if (!addressInput.contains(e.target) && !suggestionBox.contains(e.target)) {
      suggestionBox.innerHTML = "";
    }
  });

  // Mode Selector for Text Sections
  $('#text-selector').on('change', function () {
    const selectedMode = $(this).val();
    console.log('Selected Mode:', selectedMode);
    $('.form-section').hide();
    $(`.form-section.${selectedMode}`).show();
    if (selectedMode === 'Menu') {
      $('.canvas-symbol[data-id="landscape"]').trigger('click');
      console.log('Landscape canvas-symbol clicked');
    }
  });
  $('#text-selector').trigger('change');
  console.log('Initial mode triggered');
});
