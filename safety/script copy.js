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

  const screenWidth = window.screen.width * window.devicePixelRatio;
  const screenHeight = window.screen.height * window.devicePixelRatio;
  
  console.log(`Detected Screen Resolution: ${screenWidth}x${screenHeight}`);
  console.log(`Device Pixel Ratio: ${window.devicePixelRatio}`);
  
  if (screenWidth >= 3840 && screenHeight >= 2160) {
      console.log("✅ This is a 4K screen. Applying 4K settings.");
  } else {
      console.log("❌ This is smaller than 4K. Applying smaller settings.");
  }

  // Default values 
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

  // Define positions and sizes for each mode (for text)
  const modeSettings = {
    Instapost: {
      // Info Section
      infoTitle: { left: 50, top: 50, fontSize: 120, strokeWidth: 2, shadowBlur: 20 },
      infoSubtitle: { left: 50, top: 200, fontSize: 90, strokeWidth: 1.5, shadowBlur: 18 },
      infoDescription: { left: 50, top: 350, fontSize: 70, strokeWidth: 1, shadowBlur: 15 },
    
      // Concert Section
      concertTitle: { left: 50, top: 50, fontSize: 120, strokeWidth: 2, shadowBlur: 20 },
      concertDescription: { left: 50, top: 850, fontSize: 80, strokeWidth: 1, shadowBlur: 15 },
      concertDate: { left: 50, top: 420, fontSize: 120, strokeWidth: 1.5, shadowBlur: 15 },
      concertTime: { left: 730, top: 900, fontSize: 70, strokeWidth: 1.5, shadowBlur: 15 },
      concertStart: { left: 730, top: 970, fontSize: 70, strokeWidth: 1.5, shadowBlur: 15 },
      concertPlace: { left: 50, top: 920, fontSize: 50, strokeWidth: 1.5, shadowBlur: 15 },
      concertPrice: { left: 50, top: 620, fontSize: 100, strokeWidth: 1.5, shadowBlur: 18 },
      bandName: { left: 50, top: 10, fontSize: 120, strokeWidth: 1.5, shadowBlur: 15 },
      bandGenre: { left: 50, top: 130, fontSize: 80, strokeWidth: 1.5, shadowBlur: 15 },
      bandLogo: { left: 450, top: 250, scaleX: 0.6, scaleY: 0.6 },
    
      // Demo Section (Adjusted to match spacing of Concert)
      demoTitle: { left: 0, top: 50, fontSize: 120, strokeWidth: 2, shadowBlur: 20, textAlign: "center", maxWidth: 1080  },
      demoDescription: { left: 50, top: 250, fontSize: 80, strokeWidth: 1, shadowBlur: 15, textAlign: "left" },
      demoDate: { left: 0, top: 720, fontSize: 160, strokeWidth: 1.5, shadowBlur: 15 , textAlign: "center"},
      demoTime: { left: 700, top: 900, fontSize: 70, strokeWidth: 1.5, shadowBlur: 15 , textAlign: "right"},
      demoStart: { left: 700, top: 970, fontSize: 70, strokeWidth: 1.5, shadowBlur: 15 , textAlign: "right"},
      demoStreet: { left: 50, top: 950, fontSize: 50, strokeWidth: 1.5, shadowBlur: 15 , textAlign: "left"},
      demoPlace: { left: 50, top: 880, fontSize: 80, strokeWidth: 1.5, shadowBlur: 15 , textAlign: "left"},
      bandLogo: { left: 650, top: 250, maxWidth: 350, maxHeight: 250 }, 

      // Event Section (Adjusted to match spacing of Concert)
      eventTitle: { left: 50, top: 50, fontSize: 120, strokeWidth: 2, shadowBlur: 20 },
      eventDescription: { left: 50, top: 850, fontSize: 80, strokeWidth: 1, shadowBlur: 15 },
      eventDate: { left: 50, top: 420, fontSize: 120, strokeWidth: 1.5, shadowBlur: 15 },
      eventTime: { left: 730, top: 900, fontSize: 70, strokeWidth: 1.5, shadowBlur: 15 },
      eventStart: { left: 730, top: 970, fontSize: 70, strokeWidth: 1.5, shadowBlur: 15 },
      eventPlace: { left: 50, top: 920, fontSize: 50, strokeWidth: 1.5, shadowBlur: 15 },
      eventPrice: { left: 50, top: 620, fontSize: 100, strokeWidth: 1.5, shadowBlur: 18 },
    },
    

    portrait: {
      // Info Section
      infoTitle: {
        left: 250,
        top: 50,
        fontSize: 400,
        strokeWidth: 3,
        shadowBlur: 50,
      },
      infoSubtitle: {
        left: 250,
        top: 600,
        fontSize: 300,
        strokeWidth: 2,
        shadowBlur: 45,
      },
      infoDescription: {
        left: 250,
        top: 1100,
        fontSize: 250,
        strokeWidth: 1.5,
        shadowBlur: 40,
      },

      // Concert Section
      concertTitle: {
        left: 250,
        top: 50,
        fontSize: 400,
        strokeWidth: 3,
        shadowBlur: 50,
      },
      concertDescription: {
        left: 250,
        top: 600,
        fontSize: 300,
        strokeWidth: 1.5,
        shadowBlur: 40,
      },
      concertDate: {
        left: 250,
        top: 1100,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      concertTime: {
        left: 250,
        top: 1600,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      concertStart: {
        left: 250,
        top: 2100,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      concertPlace: {
        left: 250,
        top: 2600,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      concertPrice: {
        left: 250,
        top: 3100,
        fontSize: 300,
        strokeWidth: 2,
        shadowBlur: 35,
      },
      bandName: {
        left: 250,
        top: 50,
        fontSize: 400,
        strokeWidth: 2,
        shadowBlur: 35,
      },
      bandGenre: {
        left: 250,
        top: 600,
        fontSize: 300,
        strokeWidth: 2,
        shadowBlur: 35,
      },
      bandLogo: { left: 2000, top: 2000, scaleX: 0.4, scaleY: 0.4 },

  // Demo Section
      demoTitle: { left: 10, top: 50, fontSize: 520, strokeWidth: 2, shadowBlur: 20, maxWidth: 1080 },
      demoDescription: { left: 150, top: 700, fontSize: 250, strokeWidth: 1, shadowBlur: 15, maxWidth: 1600 },
      demoDate: { left: 700, top: 2820, fontSize: 650, strokeWidth: 1.5, shadowBlur: 15, maxWidth: 1800 },
      demoTime: { left: 1500, top: 3500, fontSize: 370, strokeWidth: 1.5, shadowBlur: 15, maxWidth: 1000 },
      demoStart: { left: 1800, top: 3800, fontSize: 370, strokeWidth: 1.5, shadowBlur: 15, maxWidth: 1000 },
      demoStreet: { left: 150, top: 4350, fontSize: 250, strokeWidth: 1.5, shadowBlur: 15, maxWidth: 1600 },
      demoPlace: { left: 150, top: 4080, fontSize: 300, strokeWidth: 1.5, shadowBlur: 15, maxWidth: 1600 },
      bandLogo: { left: 1050, top: 1500, maxHeight: 1500, maxWidth: 1500 }, 
  // Event Section
      eventTitle: {
        left: 250,
        top: 50,
        fontSize: 400,
        strokeWidth: 3,
        shadowBlur: 50,
      },
      eventDescription: {
        left: 250,
        top: 600,
        fontSize: 300,
        strokeWidth: 1.5,
        shadowBlur: 40,
      },
      eventDate: {
        left: 250,
        top: 1100,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      eventTime: {
        left: 250,
        top: 1600,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      eventStart: {
        left: 250,
        top: 2100,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      eventPlace: {
        left: 250,
        top: 2600,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 30,
      },
      eventPrice: {
        left: 250,
        top: 3100,
        fontSize: 300,
        strokeWidth: 2,
        shadowBlur: 35,
      },
    },

    landscape: {
      // Info Section
      infoTitle: {
        left: 300,
        top: 50,
        fontSize: 350,
        strokeWidth: 4,
        shadowBlur: 50,
      },
      infoSubtitle: {
        left: 300,
        top: 400,
        fontSize: 300,
        strokeWidth: 2.5,
        shadowBlur: 45,
      },
      infoDescription: {
        left: 300,
        top: 750,
        fontSize: 250,
        strokeWidth: 1.5,
        shadowBlur: 40,
      },

      // Concert Section
      concertTitle: {
        left: 300,
        top: 50,
        fontSize: 350,
        strokeWidth: 4,
        shadowBlur: 50,
      },
      concertDescription: {
        left: 300,
        top: 400,
        fontSize: 250,
        strokeWidth: 1.5,
        shadowBlur: 40,
      },
      concertDate: {
        left: 300,
        top: 750,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      concertTime: {
        left: 300,
        top: 1100,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      concertStart: {
        left: 300,
        top: 1450,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      concertPlace: {
        left: 300,
        top: 1800,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      concertPrice: {
        left: 300,
        top: 2150,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 35,
      },
      bandName: {
        left: 300,
        top: 2500,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 35,
      },
      bandGenre: {
        left: 300,
        top: 2850,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 35,
      },
      bandLogo: { left: 3500, top: 1400, scaleX: 0.5, scaleY: 0.5 },
      // Demo Section (Landscape)
        demoTitle: { left: 1800, top: 50, fontSize: 450, strokeWidth: 2, shadowBlur: 20 },
        demoDescription: { left: 100, top: 500, fontSize: 200, strokeWidth: 1, shadowBlur: 15 },
        demoDate: { left: 1350, top: 2200, fontSize: 500, strokeWidth: 1.5, shadowBlur: 15 },
        demoTime: { left: 3400, top: 3000, fontSize: 300, strokeWidth: 1.5, shadowBlur: 15 },
        demoStart: { left: 3600, top: 2700, fontSize: 300, strokeWidth: 1.5, shadowBlur: 15 },
        demoStreet: { left: 100, top: 2900, fontSize: 200, strokeWidth: 1.5, shadowBlur: 15 },
        demoPlace: { left: 100, top: 2600, fontSize: 250, strokeWidth: 1.5, shadowBlur: 15 },
        bandLogo: { left: 1800, top: 1100, height: 1500, width: 1500 },

      // Event Section
      eventTitle: {
        left: 300,
        top: 50,
        fontSize: 350,
        strokeWidth: 4,
        shadowBlur: 50,
      },
      eventDescription: {
        left: 300,
        top: 400,
        fontSize: 250,
        strokeWidth: 1.5,
        shadowBlur: 40,
      },
      eventDate: {
        left: 300,
        top: 750,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      eventTime: {
        left: 300,
        top: 1100,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      eventStart: {
        left: 300,
        top: 1450,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      eventPlace: {
        left: 300,
        top: 1800,
        fontSize: 200,
        strokeWidth: 1.5,
        shadowBlur: 30,
      },
      eventPrice: {
        left: 300,
        top: 2150,
        fontSize: 250,
        strokeWidth: 2,
        shadowBlur: 35,
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
            activeSection.querySelector("#event-place")?.value || "",
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
      
        const textBox = new fabric.Textbox(txt, {
          left: opts.left,
          top: opts.top,
          width: opts.maxWidth || 1080, // Define max width for text wrapping
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
          textAlign: opts.textAlign || "left", // Apply text alignment from settings
        });
      
        // Adjust positioning for center or right alignment
        if (opts.textAlign === "center") {
          textBox.set({ left: opts.left - textBox.width / 2 });
        } else if (opts.textAlign === "right") {
          textBox.set({ left: opts.left - textBox.width });
        }
      
        canvas.add(textBox);
      };
      
      
    
      const addImage = (file, opts) => {
        if (!opts || !file) return;
        const reader = new FileReader();
      
        reader.onload = function (e) {
          fabric.Image.fromURL(e.target.result, function (img) {
            const originalWidth = img.width;
            const originalHeight = img.height;
            let newWidth, newHeight;
      
            const aspectRatio = originalWidth / originalHeight;
      
            // Determine scaling based on aspect ratio
            if (originalWidth > originalHeight) {
              // Landscape: scale to maxWidth
              if (opts.maxWidth) {
                newWidth = opts.maxWidth;
                newHeight = newWidth / aspectRatio;
              }
            } else if (originalHeight > originalWidth) {
              // Portrait: scale to maxHeight
              if (opts.maxHeight) {
                newHeight = opts.maxHeight;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              // Square: Scale to the smallest max size available
              if (opts.maxWidth && opts.maxHeight) {
                const minSize = Math.min(opts.maxWidth, opts.maxHeight);
                newWidth = minSize;
                newHeight = minSize;
              }
            }
      
            img.set({
              left: opts.left,
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
      
      
    
      if (details.street) {
        const addressParts = details.street.split(", ");
        let formattedAddress = addressParts.length >= 4
          ? `${addressParts[0]} ${addressParts[1]}\n${addressParts[4]} ${addressParts[3]}-${addressParts[2]}`
          : details.street.replace(/, /g, "\n");
    
        console.log("Formatted Address for Canvas:", formattedAddress);
        addText(`${formattedAddress}`, settings.demoStreet);
      }
    
      if (details.place) {
        addText(`${details.place}`, settings.demoPlace);
      }
    
      if (details.image && settings.bandLogo) {
        addImage(details.image, settings.bandLogo);
      }
    
      if (details.title) addText(details.title, settings.demoTitle);
      if (details.description) addText(details.description, settings.demoDescription);
      if (details.date) addText(`${details.date}`, settings.demoDate);
      if (details.time) addText(`Meetup: ${details.time}`, settings.demoTime);
      if (details.start) addText(`Start: ${details.start}`, settings.demoStart);
    
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
editIcon.style.left = `59%`; // Fixed position
editIcon.style.top = `8%`; // Fixed position
document.body.appendChild(editIcon);

function showEditIcon(target) {
  if (!target || !target.oCoords) return;
  editIcon.style.display = "block"; // Always appear at the fixed position
}

// Show edit icon only when a single text object is selected
canvas.on("selection:created", function (e) {
  const selectedObjects = e.selected || [];
  if (selectedObjects.length === 1 && selectedObjects[0].type === "textbox") {
    showEditIcon(selectedObjects[0]);
  } else {
    editIcon.style.display = "none";
  }
});

canvas.on("selection:cleared", function () {
  editIcon.style.display = "none";
});

// Multi-line Text Editing with Fixed Position and Scaled Down
editIcon.addEventListener("click", function () {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "textbox") {
    const originalText = activeObject.text;
    const textarea = document.createElement("textarea");
    textarea.value = originalText;

    // Position the textarea directly under the edit icon
    textarea.style.position = "fixed";
    textarea.style.left = `59%`; // Align with the icon
    textarea.style.top = `10%`; // Slightly below the icon
    textarea.style.width = "200px"; // Fixed width for readability
    textarea.style.height = "50px"; // Fixed height
    textarea.style.fontSize = "1em"; // Uniform size
    textarea.style.fontFamily = "Arial, sans-serif";
    textarea.style.color = "black"; // Ensure black text
    textarea.style.background = "rgba(255, 255, 255, 0.9)";
    textarea.style.border = "1px solid #ccc";
    textarea.style.padding = "5px";
    textarea.style.zIndex = "1001";
    textarea.style.overflow = "hidden";
    textarea.style.resize = "none"; // Prevent resizing
    textarea.style.whiteSpace = "pre-wrap"; // Preserve line breaks

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
  if (activeObject && activeObject.type === "textbox") {
    showEditIcon(activeObject);
  }
});


//  Create delete icon
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

//  Create Move Up Icon
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

//  Create Move Down Icon
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

//  Function to position icons next to the delete icon
function positionIcons(target) {
    if (!target || !target.oCoords) return;

    deleteIcon.style.left = `63%`;
    deleteIcon.style.top = `8%`;
    deleteIcon.style.display = "block";

    moveUpIcon.style.left = `66%`;  // 🔼 Positioning next to delete icon
    moveUpIcon.style.top = `8%`;
    moveUpIcon.style.display = "block";

    moveDownIcon.style.left = `69%`; // 🔽 Positioning next to move up icon
    moveDownIcon.style.top = `8%`;
    moveDownIcon.style.display = "block";
}

//  Delete Selected Object
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
        hideIcons(); // Hide icons after deletion
    }
});

//  Move Object Forward (One Layer Up)
moveUpIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringForward(activeObject);
        canvas.renderAll();
    }
});

//  Move Object Backward (One Layer Down)
moveDownIcon.addEventListener("click", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendBackwards(activeObject);
        canvas.renderAll();
    }
});

//  Show Icons When Object is Selected
canvas.on("object:selected", function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        positionIcons(activeObject);
    }
});

//  Hide Icons When Selection is Cleared
canvas.on("selection:cleared", function () {
    hideIcons();
});


// Create Lock Icon
let lockIcon = document.createElement("div");
lockIcon.innerHTML = "🔓"; // starts as unlocked (open lock)
lockIcon.style.position = "fixed";
lockIcon.style.width = "24px";
lockIcon.style.height = "24px";
lockIcon.style.fontSize = "36px";
lockIcon.style.cursor = "pointer";
lockIcon.style.display = "none";
lockIcon.style.zIndex = "1000";
document.body.appendChild(lockIcon);

// Update the positionIcons function to include the lock icon
function positionIcons(target) {
  if (!target || !target.oCoords) return;

  // Position Delete Icon
  deleteIcon.style.left = `63%`;
  deleteIcon.style.top = `8%`;
  deleteIcon.style.display = "block";

  // Position Move Up Icon
  moveUpIcon.style.left = `66%`;
  moveUpIcon.style.top = `8%`;
  moveUpIcon.style.display = "block";

  // Position Move Down Icon
  moveDownIcon.style.left = `69%`;
  moveDownIcon.style.top = `8%`;
  moveDownIcon.style.display = "block";
  
  // Position Lock Icon
  lockIcon.style.left = `72%`;
  lockIcon.style.top = `8%`;
  lockIcon.style.display = "block";
  
  // Update lock icon based on the object's lock state:
  if (
    target.lockMovementX &&
    target.lockMovementY &&
    target.lockScalingX &&
    target.lockScalingY &&
    target.lockRotation
  ) {
    lockIcon.innerHTML = "🔒"; // Object is locked
  } else {
    lockIcon.innerHTML = "🔓"; // Object is unlocked
  }
}

// Toggle lock/unlock on icon click
lockIcon.addEventListener("click", function () {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    // Check if the object is currently locked on movement, scaling, and rotation
    if (
      activeObject.lockMovementX &&
      activeObject.lockMovementY &&
      activeObject.lockScalingX &&
      activeObject.lockScalingY &&
      activeObject.lockRotation
    ) {
      // Unlock the object
      activeObject.lockMovementX = false;
      activeObject.lockMovementY = false;
      activeObject.lockScalingX = false;
      activeObject.lockScalingY = false;
      activeObject.lockRotation = false;
      lockIcon.innerHTML = "🔓"; // Show open lock
    } else {
      // Lock the object
      activeObject.lockMovementX = true;
      activeObject.lockMovementY = true;
      activeObject.lockScalingX = true;
      activeObject.lockScalingY = true;
      activeObject.lockRotation = true;
      lockIcon.innerHTML = "🔒"; // Show closed lock
    }
    canvas.renderAll();
  }
});

// Show icons when an object is selected (including lock icon)
canvas.on("object:selected", function () {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    positionIcons(activeObject);
  }
});

// Hide icons when selection is cleared (update to include lock icon)
canvas.on("selection:cleared", function () {
  hideIcons();
});

function hideIcons() {
  deleteIcon.style.display = "none";
  moveUpIcon.style.display = "none";
  moveDownIcon.style.display = "none";
  lockIcon.style.display = "none";
}

  $("#band-logo-upload").on("change", function (e) {
    console.log("File input triggered");
    const input = e.target;
    if (input.files && input.files[0]) {
      console.log("File selected:", input.files[0]);
    } else {
      console.log("No file selected.");
    }
  });

  // Get UI elements from the HTML
  const colorPicker = document.getElementById("color-picker");
  const sizeSlider = document.getElementById("size-slider");
  const toggleDrawing = document.getElementById("toggle-drawing");

  // Initialize fabric.js drawing settings
  canvas.isDrawingMode = false;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  updateBrushSettings(); // Ensure correct brush settings at start

  // Update brush settings function
  function updateBrushSettings() {
    if (!canvas.freeDrawingBrush) return;

    canvas.freeDrawingBrush.color = colorPicker.value;
    canvas.freeDrawingBrush.width = parseInt(sizeSlider.value, 10);
    canvas.freeDrawingBrush.decimate = 2; // Smooth lines
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 5,
      color: colorPicker.value,
      offsetX: 0,
      offsetY: 0,
    });
  }

  // Update brush color dynamically
  colorPicker.addEventListener("input", updateBrushSettings);

  // Update brush size dynamically
  sizeSlider.addEventListener("input", updateBrushSettings);

  // Toggle drawing mode
  toggleDrawing.addEventListener("click", function () {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    toggleDrawing.textContent = canvas.isDrawingMode
      ? "Stop drawing"
      : "Start drawing";
  });

  const saveUserPlacements = () => {
    const currentMode = document.querySelector(".canvas-symbol-active")?.dataset.id || "Instapost";
    let elements = {};
  
    // Save background color or image
    const canvasBg = {
      type: canvas.backgroundImage ? "image" : "color",
      value: canvas.backgroundImage ? canvas.backgroundImage._element?.src : canvas.backgroundColor,
    };
  
    // Save all objects (text & images)
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
  
  //  Load saved placements from JSON
  const loadUserPlacements = (file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = JSON.parse(e.target.result);
  
      // Clear canvas before loading
      canvas.clear();
  
      // Restore background (color or image)
      if (data.background?.type === "image") {
        fabric.Image.fromURL(data.background.value, function (img) {
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        });
      } else {
        canvas.setBackgroundColor(data.background?.value || "#000000", canvas.renderAll.bind(canvas));
      }
  
      // Restore elements
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
              ? new fabric.Shadow({
                  blur: obj.shadowBlur,
                  color: obj.shadowColor,
                })
              : null,
            fill: obj.fill || "#FFFFFF",
          });
          textEl.set({ name }); // Keep user-friendly name
          canvas.add(textEl);
        } else if (obj.type === "image") {
          fabric.Image.fromURL(obj.src, function (img) {
            img.set({
              left: obj.left,
              top: obj.top,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
            });
            img.set({ name }); // Keep user-friendly name
            canvas.add(img);
          });
        }
      });
  
      canvas.renderAll();
      console.log("User placements imported!");
    };
  
    reader.readAsText(file);
  };
  
  //  File input to load JSON
  document.getElementById("import-placements").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      loadUserPlacements(file);
    }
  });
  
  //  Buttons to save & load placements
  document.getElementById("save-placements").addEventListener("click", saveUserPlacements);
  

  // Trigger default mode
  $('.canvas-symbol[data-id="Instapost"]').click();
});
