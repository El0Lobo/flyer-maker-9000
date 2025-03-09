jQuery(document).ready(function ($) {
  const canvas = new fabric.Canvas("wa-image-editor-canvas", {
    preserveObjectStacking: true,
  });
  canvas.enableRetinaScaling = false; // No pixel doubling

  fabric.Object.prototype.cornerColor = "#8cff00";
  fabric.Object.prototype.cornerStrokeColor = "#FFFFFF";
  fabric.Object.prototype.strokeWidth = "100";
  fabric.Object.prototype.lockScalingFlip = true;
  fabric.Object.prototype.set({
    borderColor: "white",
    borderScaleFactor: 6,
  });

  // Custom control handles
  fabric.Object.prototype._drawControl = controlHandles;
  fabric.Object.prototype.cornerSize = 50;

  function controlHandles(control, ctx, methodName, left, top) {
    if (!this.isControlVisible(control)) return;
    const size = this.cornerSize;
    ctx.beginPath();
    ctx.arc(left + size / 2, top + size / 2, size / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = "pink";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeSize = 400;
    ctx.strokeStyle = "red";
    ctx.stroke();
  }

  let originalWidth = 1080;
  let originalHeight = 1080;

  // Define modes with standards
  const modes = {
    Instapost: {
      width: 1080,
      height: 1080,
      bg: "material/images/Backgrounds/universal/chalk.png",
      defaultZoom: 0.5,
      defaultPanX: 0,
      defaultPanY: -400,
    },
    portrait: {
      width: 3508,
      height: 4960,
      bg: "material/images/Backgrounds/universal/chalk.png",
      defaultZoom: 0.14,
      defaultPanX: -1200,
      defaultPanY: -2260,
    },
    landscape: {
      width: 4960,
      height: 3508,
      bg: "material/images/Backgrounds/universal/chalk.png",
      defaultZoom: 0.2,
      defaultPanX: -1900,
      defaultPanY: -1530,
    },
  };

  // Define positions and sizes for each mode (for text)
  const modeSettings = {
    Instapost: {
      title: {
        left: 50,
        top: 50,
        fontSize: 150,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      subtitle: {
        left: 50,
        top: 220,
        fontSize: 100,
        strokeWidth: 1.5,
        shadowBlur: 25,
      },
      description: {
        left: 50,
        top: 320,
        fontSize: 60,
        strokeWidth: 1,
        shadowBlur: 20,
      },
      price: {
        left: 50,
        top: 800,
        fontSize: 100,
        strokeWidth: 1.5,
        shadowBlur: 22,
      },
      time: {
        left: 50,
        top: 900,
        fontSize: 100,
        strokeWidth: 1.5,
        shadowBlur: 18,
      },
    },
    portrait: {
      title: {
        left: 100,
        top: 100,
        fontSize: 200,
        strokeWidth: 3,
        shadowBlur: 40,
      },
      subtitle: {
        left: 100,
        top: 300,
        fontSize: 150,
        strokeWidth: 2,
        shadowBlur: 35,
      },
      description: {
        left: 100,
        top: 500,
        fontSize: 80,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      price: {
        left: 100,
        top: 1200,
        fontSize: 150,
        strokeWidth: 2.5,
        shadowBlur: 28,
      },
      time: {
        left: 100,
        top: 1400,
        fontSize: 150,
        strokeWidth: 2.5,
        shadowBlur: 28,
      },
    },
    landscape: {
      title: {
        left: 150,
        top: 50,
        fontSize: 350,
        strokeWidth: 4,
        shadowBlur: 50,
      },
      subtitle: {
        left: 150,
        top: 250,
        fontSize: 120,
        strokeWidth: 2.5,
        shadowBlur: 40,
      },
      description: {
        left: 150,
        top: 400,
        fontSize: 70,
        strokeWidth: 1.5,
        shadowBlur: 35,
      },
      price: {
        left: 150,
        top: 1000,
        fontSize: 120,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      time: {
        left: 150,
        top: 1100,
        fontSize: 120,
        strokeWidth: 2,
        shadowBlur: 30,
      },
    },
  };

  function updateTransform() {
    const scale = parseFloat($("#zoom-range").val());
    const panX = parseFloat($("#pan-x").val());
    const panY = parseFloat($("#pan-y").val());
    const container = canvas.getElement().parentNode;
    container.style.transformOrigin = "center";
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }
  canvas.on("mouse:wheel", function (opt) {
    // Get current zoom level from the input
    let scale = parseFloat($("#zoom-range").val());

    // Adjust zoom level based on wheel delta
    const delta = opt.e.deltaY > 0 ? -0.02 : 0.02;
    scale = Math.min(Math.max(scale + delta, 0.02), 3); // Clamp between 0.1 and 3

    // Update zoom input and apply transform
    $("#zoom-range").val(scale.toFixed(2));
    updateTransform();

    // Prevent default behavior
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    // Get current pan values from the inputs
    let panX = parseFloat($("#pan-x").val());
    let panY = parseFloat($("#pan-y").val());

    const step = 10; // Pan step size (adjust as needed)

    // Adjust pan values based on the pressed arrow key
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
        return; // Ignore other keys
    }

    // Update inputs and apply the transform
    $("#pan-x").val(panX.toFixed(0));
    $("#pan-y").val(panY.toFixed(0));
    updateTransform();

    // Prevent default scrolling behavior if necessary
    e.preventDefault();
  });
  let isPanning = false;
  let lastMousePos = { x: 0, y: 0 };

  document.addEventListener("mousedown", function (e) {
    if (e.button === 1) {
      // Middle mouse button
      isPanning = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
      canvas.skipTargetFind = true; // Prevent Fabric.js interference
      canvas.selection = false;
      e.preventDefault();
    }
  });

  document.addEventListener("mousemove", function (e) {
    if (isPanning) {
      // Calculate deltas
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      // Update pan values
      let panX = parseFloat($("#pan-x").val()) + deltaX;
      let panY = parseFloat($("#pan-y").val()) + deltaY;

      // Update inputs and apply transform
      $("#pan-x").val(panX.toFixed(0));
      $("#pan-y").val(panY.toFixed(0));
      updateTransform();

      // Update last mouse position
      lastMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  document.addEventListener("mouseup", function (e) {
    if (isPanning && e.button === 1) {
      // Middle mouse button
      isPanning = false;
      canvas.skipTargetFind = false; // Re-enable Fabric.js interactions
      canvas.selection = true;
    }
  });

  // JSON Import Functionality for Assets
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

  loadAssetsFromJSON("./assets.json"); // Load your assets JSON here

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

    // Update canvas dimensions
    originalWidth = info.width;
    originalHeight = info.height;
    canvas.setWidth(originalWidth);
    canvas.setHeight(originalHeight);

    // Set background
    fabric.Image.fromURL(info.bg, function (img) {
      img.set({
        width: originalWidth,
        height: originalHeight,
        originX: "left",
        originY: "top",
      });
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });

    // Reset zoom & pan
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

  // Default mode
  setCanvasMode("Instapost");

  // Event listeners for zoom and pan adjustments
  $("#zoom-range").on("input", updateTransform);
  $("#pan-x,#pan-y").on("input change", updateTransform);

  $("#export-png").click(function () {
    const dataURL = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "export.png";
    link.click();
  });

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

  document
    .getElementById("add-event-details")
    .addEventListener("click", function () {
      const details = {
        title: document.getElementById("event-title").value,
        subtitle: document.getElementById("event-subtitle").value,
        description: document.getElementById("event-description").value,
        price: document.getElementById("event-price").value,
        time: document.getElementById("event-time").value,
        textColor: document.getElementById("apply-color").checked
          ? document.getElementById("text-color-picker").value
          : "#000",
        fontFamily: document.getElementById("font-picker").value || "Arial",
        textOutline: document.getElementById("apply-outline").checked
          ? document.getElementById("text-outline-picker").value
          : null,
        outlineSize: document.getElementById("apply-outline").checked
          ? parseFloat(document.getElementById("outline-size-slider").value)
          : 0,
        shadowBlur: document.getElementById("apply-glow").checked
          ? parseFloat(document.getElementById("glow-size-slider").value)
          : 0,
        textGlow: document.getElementById("apply-glow").checked
          ? document.getElementById("text-glow-picker").value
          : null,
      };

      const currentMode = $(".canvas-symbol-active").data("id") || "Instapost";
      const settings = modeSettings[currentMode];

      // Function to add text to the canvas (defined here so `details` is accessible)
      const addText = (txt, opts) => {
        if (txt) {
          const textEl = new fabric.Text(txt, {
            ...opts,
            stroke: details.textOutline,
            strokeWidth: details.textOutline ? opts.strokeWidth : 0,
            shadow: details.textGlow
              ? new fabric.Shadow({
                  color: details.textGlow,
                  blur: opts.shadowBlur,
                })
              : null,
            fill: details.textColor,
            fontFamily: details.fontFamily,
          });
          canvas.add(textEl);
          return textEl.top + textEl.fontSize + 10;
        }
        return opts.top;
      };

      // Add title
      if (details.title) {
        addText(details.title, { ...settings.title, fontWeight: "bold" });
      }

      // Add subtitle
      if (details.subtitle) {
        addText(details.subtitle, settings.subtitle);
      }

      // Add description
      if (details.description) {
        addText(details.description, settings.description);
      }

      // Add price
      if (details.price) {
        addText(`Price: ${details.price}`, settings.price);
      }

      // Add time
      if (details.time) {
        addText(`Time: ${details.time}`, settings.time);
      }

      canvas.renderAll();
    });

  function loadRegularFonts() {
    console.log("Loading fonts from JSON...");
    $.getJSON("./fonts.json", function (data) {
      const styleElement = document.createElement("style");
      document.head.appendChild(styleElement);

      const fontPromises = [];

      // Standards
      if (data.Standards && data.Standards.root) {
        console.log("Processing 'Standards' fonts...");
        const standardGroup1 = $('<optgroup label="Standards"></optgroup>');
        const standardGroup2 = $('<optgroup label="Standards"></optgroup>');
        data.Standards.root.forEach((fontEntry) => {
          if (fontEntry.name && fontEntry.file) {
            styleElement.sheet.insertRule(
              `
              @font-face {
                font-family: '${fontEntry.name}';
                src: url('${fontEntry.file}') format('truetype');
              }
            `,
              styleElement.sheet.cssRules.length
            );

            const optionHTML = `<option value="${fontEntry.name}" style="font-family:'${fontEntry.name}', sans-serif;">${fontEntry.name}</option>`;
            standardGroup1.append(optionHTML);
            standardGroup2.append(optionHTML);

            const font = new FontFace(
              fontEntry.name,
              `url('${fontEntry.file}')`
            );
            fontPromises.push(font.load());
            document.fonts.add(font);
          }
        });
        $("#font-picker").append(standardGroup1);
        $("#additional-text-font").append(standardGroup2);
      } else {
        console.warn("No 'Standards' fonts found in JSON.");
      }

      // Other categories
      for (const category in data) {
        if (category !== "Standards" && data[category].root) {
          console.log(`Processing category: ${category}`);
          const group1 = $(`<optgroup label="${category}"></optgroup>`);
          const group2 = $(`<optgroup label="${category}"></optgroup>`);
          data[category].root.forEach((fontEntry) => {
            if (fontEntry.name && fontEntry.file) {
              styleElement.sheet.insertRule(
                `
                @font-face {
                  font-family: '${fontEntry.name}';
                  src: url('${fontEntry.file}') format('truetype');
                }
              `,
                styleElement.sheet.cssRules.length
              );

              const optionHTML = `<option value="${fontEntry.name}" style="font-family:'${fontEntry.name}', sans-serif;">${fontEntry.name}</option>`;
              group1.append(optionHTML);
              group2.append(optionHTML);

              const font = new FontFace(
                fontEntry.name,
                `url('${fontEntry.file}')`
              );
              fontPromises.push(font.load());
              document.fonts.add(font);
            }
          });
          $("#font-picker").append(group1);
          $("#additional-text-font").append(group2);
        }
      }

      // Hardcoded regular fonts
      console.log("Processing hardcoded regular fonts...");
      const regularGroup1 = $('<optgroup label="Regular Fonts"></optgroup>');
      const regularGroup2 = $('<optgroup label="Regular Fonts"></optgroup>');
      const regularFonts = [
        "Arial",
        "Verdana",
        "Times New Roman",
        "Georgia",
        "Courier New",
        "Tahoma",
        "Trebuchet MS",
        "Lucida Console",
        "Impact",
        "Comic Sans MS",
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

  // Opacity Slider
  $("#opacity-slider").on("input change", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const opacityValue = parseFloat($(this).val());
      activeObject.set("opacity", opacityValue);
      canvas.renderAll();
    }
  });

  // SVG Color Picker
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

  // Edit Icon for Text
  let editIcon = document.createElement("div");
  editIcon.innerHTML = "🖊️";
  editIcon.style.position = "fixed";
  editIcon.style.width = "24px";
  editIcon.style.height = "24px";
  editIcon.style.fontSize = "36px";
  editIcon.style.cursor = "pointer";
  editIcon.style.display = "none";
  editIcon.style.zIndex = "1000";
  document.body.appendChild(editIcon);

  function positionEditIcon(target) {
    if (!target || !target.oCoords) return;
    // The code below positions the icon at fixed positions currently.
    // Adjust as needed if you want dynamic positioning.
    editIcon.style.left = `59%`;
    editIcon.style.top = `8%`;
    editIcon.style.display = "block";
  }

  canvas.on("selection:created", function (e) {
    // Ensure 'selected' exists and is an array
    const selectedObjects = e.selected || [];

    // Check if only one object is selected
    if (selectedObjects.length === 1) {
      const target = selectedObjects[0];

      // Ensure the selected object is a text object
      if (target && target.type === "text") {
        positionEditIcon(target);
      }
    } else {
      // Hide the edit icon if no object or multiple objects are selected
      editIcon.style.display = "none";
    }
  });

  canvas.on("selection:cleared", function () {
    editIcon.style.display = "none";
  });

  editIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "text") {
      const originalText = activeObject.text;
      const input = document.createElement("input");
      input.type = "text";
      input.value = originalText;

      // Style input
      input.style.position = "absolute";
      input.style.left = `41%`;
      input.style.top = `8%`;
      input.style.fontSize = `2em`;
      input.style.fontFamily = activeObject.fontFamily;
      input.style.color = "rgba(0, 0, 0, 0.9)";
      input.style.background = "rgba(255, 255, 255, 0.9)";
      input.style.border = "1px solid #ccc";
      input.style.padding = "5px";
      input.style.zIndex = "1001";

      document.body.appendChild(input);
      input.focus();

      input.addEventListener("blur", function () {
        const newText = input.value.trim();
        if (newText) {
          activeObject.text = newText;
          canvas.renderAll();
        }
        document.body.removeChild(input);
        editIcon.style.display = "none";
      });

      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          input.blur();
        }
      });
    }
  });

  canvas.on("object:modified", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "text") {
      positionEditIcon(activeObject);
    }
  });

  $("#band-logo-upload").on("change", function (e) {
    console.log("File input triggered");
    const input = e.target;
    if (input.files && input.files[0]) {
      console.log("File selected:", input.files[0]);
    } else {
      console.log("No file selected.");
    }
  });

  // Settings for different hierarchy levels
  const menuCategorySettings = {
    left: 300,
    topIncrement: 230,
    fontSize: 250,
    fontFamily: "Arial",
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: null,
  };

  const menuSubcategorySettings = {
    left: 320,
    topIncrement: 240,
    fontSize: 200,
    fontFamily: "Arial",
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: null,
  };

  // Item name settings
  const menuItemNameSettings = {
    left: 340,
    topIncrement: 145, // spacing between each item name line
    fontSize: 140,
    fontFamily: "Arial",
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: null,
  };

  // For single item amount/price
  const menuItemAmountSettings = {
    left: 600,
    fontSize: 240,
    fontFamily: "Arial",
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: null,
  };
  const menuItemPriceSettings = {
    left: 800,
    fontSize: 240,
    fontFamily: "Arial",
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: null,
  };

  // For grouped item amount/price
  const menuItemAmountGroupSettings = {
    left: 600,
    fontSize: 240,
    fontFamily: "Arial",
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: null,
  };
  const menuItemPriceGroupSettings = {
    left: 800,
    fontSize: 240,
    fontFamily: "Arial",
    fill: "#ffffff",
    strokeWidth: 0,
    shadow: null,
  };

  // Additional spacing after each group of items
  const menuGroupSpacing = 10;

  fetch("drinks.json")
    .then((response) => response.json())
    .then((data) => {
      const categories = Object.values(data)[0];
      const container = document.getElementById("menu-form-container");

      const canvasMenuData = [];

      for (const category in categories) {
        const items = categories[category];

        // Create main category section in DOM
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<h2>${category}</h2>`;
        container.appendChild(categoryDiv);

        let categoryObj = {
          categoryLabel: category,
          subcategories: [],
        };

        if (Array.isArray(items)) {
          // No subcategories
          const lines = createGroupedTable(items, categoryDiv, category);
          categoryObj.subcategories.push({
            subcategoryLabel: null,
            lines: lines,
          });
        } else {
          // With subcategories
          for (const subcategory in items) {
            const subcategoryDiv = document.createElement("div");
            subcategoryDiv.innerHTML = `<h3>${subcategory}</h3>`;
            container.appendChild(subcategoryDiv);

            const lines = createGroupedTable(
              items[subcategory],
              subcategoryDiv,
              `${category} - ${subcategory}`
            );
            categoryObj.subcategories.push({
              subcategoryLabel: subcategory,
              lines: lines,
            });
          }
        }

        // Spacing in DOM
        const categorySeparator = document.createElement("div");
        categorySeparator.style.height = "30px";
        container.appendChild(categorySeparator);

        canvasMenuData.push(categoryObj);
      }

      const addMenuButton = document.getElementById("add-menu");
      addMenuButton.addEventListener("click", function () {
        // Get selected font
        const selectedFont =
          document.getElementById("font-picker").value || "Arial";

        // Get styling options from inputs
        const textColor = document.getElementById("apply-color").checked
          ? document.getElementById("text-color-picker").value
          : "#000000";

        const textOutline = document.getElementById("apply-outline").checked
          ? document.getElementById("text-outline-picker").value
          : null;

        const textGlow = document.getElementById("apply-glow").checked
          ? document.getElementById("text-glow-picker").value
          : null;

        const outlineSize = textOutline ? 2 : 0;
        const glowBlur = textGlow ? 15 : 0;
        const glowShadow = textGlow
          ? new fabric.Shadow({ color: textGlow, blur: glowBlur })
          : null;

        // Apply styling and font to all settings
        applyTextSettings(
          menuCategorySettings,
          selectedFont,
          textColor,
          textOutline,
          outlineSize,
          glowShadow
        );
        applyTextSettings(
          menuSubcategorySettings,
          selectedFont,
          textColor,
          textOutline,
          outlineSize,
          glowShadow
        );
        applyTextSettings(
          menuItemNameSettings,
          selectedFont,
          textColor,
          textOutline,
          outlineSize,
          glowShadow
        );
        applyTextSettings(
          menuItemAmountSettings,
          selectedFont,
          textColor,
          textOutline,
          outlineSize,
          glowShadow
        );
        applyTextSettings(
          menuItemPriceSettings,
          selectedFont,
          textColor,
          textOutline,
          outlineSize,
          glowShadow
        );
        applyTextSettings(
          menuItemAmountGroupSettings,
          selectedFont,
          textColor,
          textOutline,
          outlineSize,
          glowShadow
        );
        applyTextSettings(
          menuItemPriceGroupSettings,
          selectedFont,
          textColor,
          textOutline,
          outlineSize,
          glowShadow
        );

        addMenuToCanvas(canvasMenuData);

        // Add predefined image

        // Function to load and add an image to the canvas
        function addImageToCanvas(imageConfig) {
          fabric.Image.fromURL(imageConfig.url, function (img) {
            img.set(imageConfig.options);
            canvas.add(img);
            canvas.renderAll();
          });
        }

        // Iterate through the array and add each image
        images.forEach(addImageToCanvas);
      });

      function createGroupedTable(items, container, categoryLabel) {
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.innerHTML = `
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
        container.appendChild(table);

        const tbody = table.querySelector("tbody");
        const lines = [];

        // Group items by Amount and Price
        const groupedItems = {};
        items.forEach((item) => {
          const key = `${item.Amount || ""}_${item.Price || ""}`;
          if (!groupedItems[key]) {
            groupedItems[key] = [];
          }
          groupedItems[key].push(item.Name);
        });

        for (const groupKey in groupedItems) {
          const [amount, price] = groupKey.split("_");
          const names = groupedItems[groupKey];

          // Add a single row for the group in the DOM table
          const row = document.createElement("tr");
          row.innerHTML = `
          <td style="border: 1px solid #ddd; padding: 8px;">${names.join(
            "<br>"
          )}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
            amount || "-"
          }</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
            price || "-"
          }</td>
        `;
          tbody.appendChild(row);

          // For the canvas, store the group as a single object
          lines.push({
            names: names,
            amount: amount || "-",
            price: price || "-",
          });
        }

        return lines;
      }

      // function addMenuToCanvas(data) {
      //   let currentTop = 500; // starting top for categories

      //   data.forEach(categoryObj => {
      //     // Category line
      //     currentTop = addTextLine(categoryObj.categoryLabel, menuCategorySettings, menuCategorySettings.left, currentTop);
      //     currentTop += menuCategorySettings.topIncrement;

      //     categoryObj.subcategories.forEach(subObj => {
      //       if (subObj.subcategoryLabel) {
      //         currentTop = addTextLine(subObj.subcategoryLabel, menuSubcategorySettings, menuSubcategorySettings.left, currentTop);
      //         currentTop += menuSubcategorySettings.topIncrement;
      //       }

      //       // Each line in subObj.lines is { names: [...], amount, price }
      //       subObj.lines.forEach(line => {
      //         const isGrouped = line.names.length > 1;

      //         const amountSettings = isGrouped ? menuItemAmountGroupSettings : menuItemAmountSettings;
      //         const priceSettings = isGrouped ? menuItemPriceGroupSettings : menuItemPriceSettings;

      //         // startTop for the first name
      //         const startTop = currentTop;

      //         // Print names stacked vertically
      //         line.names.forEach((name, index) => {
      //           const lineTop = startTop + (index * menuItemNameSettings.topIncrement);
      //           addTextLine(name, menuItemNameSettings, menuItemNameSettings.left, lineTop);
      //         });

      //         // Calculate vertical center line for amount/price if grouped
      //         const n = line.names.length;
      //         const centerTop = startTop + ((n - 1) * menuItemNameSettings.topIncrement / 2);

      //         // If grouped, align amount/price in the middle; if single, align at the first line
      //         const verticalPos = isGrouped ? centerTop : startTop;

      //         addTextLine(line.amount, amountSettings, amountSettings.left, verticalPos);
      //         addTextLine(line.price, priceSettings, priceSettings.left, verticalPos);

      //         // After printing the group of items, move currentTop down for next group
      //         currentTop = startTop + (n * menuItemNameSettings.topIncrement) + menuGroupSpacing;
      //       });
      //     });
      //   });

      //   canvas.renderAll();
      // }
      function addImageToCanvas(imageConfig) {
        fabric.Image.fromURL(imageConfig.url, function (img) {
          img.set(imageConfig.options);
          canvas.add(img);
          canvas.sendToBack(img); // Ensure the image is below all other elements
          canvas.renderAll();
        });
      }
      // function addMenuToCanvas(data) {
      //   const canvasWidth = 4960;
      //   const canvasHeight = 3508;
      //   const groupPaddingTop = 20; // Extra space above each group
      //   const columnWidth = 800; // Width for each column
      //   const baseRowHeight = 150; // Base Height for each row

      //   // Define starting positions for each section
      //   const positions = {
      //     Alkohol: { left: 300, top: 320 }, // Left side
      //     Softdrinks: { left: canvasWidth - 1900, top: 320 }, // Right side
      //     Snacks: { left: canvasWidth / 2 - 200, top: canvasHeight - 900 } // Centered at bottom
      //   };

      //   data.forEach((categoryObj) => {
      //     const categoryName = categoryObj.categoryLabel;
      //     const position = positions[categoryName] || { left: 100, top: 100 }; // Default position

      //     let currentLeft = position.left;
      //     let currentTop = position.top;

      //     // Add the category label
      //     currentTop = addTextLine(categoryName, menuCategorySettings, currentLeft, currentTop);
      //     currentTop += menuCategorySettings.topIncrement;

      //     categoryObj.subcategories.forEach((subObj) => {
      //       if (subObj.subcategoryLabel) {
      //         // Add the subcategory label
      //         currentTop = addTextLine(subObj.subcategoryLabel, menuSubcategorySettings, currentLeft, currentTop);
      //         currentTop += menuSubcategorySettings.topIncrement;
      //       }

      //       subObj.lines.forEach((line) => {
      //         const lineCount = line.names.length; // Number of names
      //         const groupHeight = lineCount * menuItemNameSettings.topIncrement;

      //         // Apply extra padding above the group
      //         currentTop += groupPaddingTop;

      //         // Calculate the group center for alignment
      //         const groupCenterTop = currentTop + (groupHeight - menuItemNameSettings.topIncrement) / 2;

      //         // Add names (stacked vertically)
      //         line.names.forEach((name, index) => {
      //           const itemTop = currentTop + index * menuItemNameSettings.topIncrement;
      //           addTextLine(name, menuItemNameSettings, currentLeft, itemTop);
      //         });

      //         // Add amount and price
      //         addTextLine(line.amount, menuItemAmountGroupSettings, currentLeft + 1000, groupCenterTop);
      //         addTextLine(line.price, menuItemPriceGroupSettings, currentLeft + 1400, groupCenterTop);

      //         // Move to the next group
      //         currentTop += groupHeight + 20; // Add padding for the next group
      //       });

      //       currentTop += menuGroupSpacing; // Add spacing after subcategories
      //     });

      //     currentTop += menuGroupSpacing; // Add spacing after categories
      //   });

      //   // Add predefined images below text
      //   const images = [
      //     {
      //       url: 'material/images/Assets/Title.png',
      //       options: { left: 1700, top: 100, scaleX: 1, scaleY: 1 }
      //     },
      //     {
      //       url: 'material/images/Assets/hate facism chalk.png',
      //       options: { left: 4100, top: 100, scaleX: 1, scaleY: 1 }
      //     },
      //     {
      //       url: 'material/images/Assets/beer.png',
      //       options: { left: 1700, top: 800, scaleX: 1, scaleY: 1 }
      //     },
      //     {
      //       url: 'material/images/Logos/Logo/fish color.png',
      //       options: { left: 100, top: 2850, scaleX: 0.4, scaleY: 0.4 }
      //     }
      //   ];

      //   // Add images to the canvas below the text
      //   images.forEach((imageConfig) => addImageToCanvas(imageConfig));
      //   canvas.renderAll();
      // }

      // function addTextLine(txt, opts, left, top) {
      //   if (!txt) return top;
      //   const textEl = new fabric.Text(txt, {
      //     left: left,
      //     top: top,
      //     fontSize: opts.fontSize,
      //     fontFamily: opts.fontFamily,
      //     fill: opts.fill,
      //     stroke: opts.stroke || null,
      //     strokeWidth: opts.strokeWidth || 0,
      //     shadow: opts.shadow || null
      //   });
      //   canvas.add(textEl);
      //   return top; // increments handled outside
      // }

      function applyTextSettings(
        settings,
        fontFamily,
        fill,
        stroke,
        strokeWidth,
        shadow
      ) {
        settings.fontFamily = fontFamily;
        settings.fill = fill;
        settings.stroke = stroke;
        settings.strokeWidth = strokeWidth;
        settings.shadow = shadow;
      }
    })
    .catch((error) => {
      console.error("Error fetching or processing the JSON:", error);
    });

  // Trigger default mode
  $('.canvas-symbol[data-id="Instapost"]').click();
});
