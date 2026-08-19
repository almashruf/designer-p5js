"use client";

import { useEffect, useRef, useState } from "react";
import p5 from "p5";

export default function CanvasEditor() {
  const canvasRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);

  const editorRef = useRef({
    objects: [
      {
        id: 1,
        type: "rect",
        x: 400,
        y: 300,
        width: 220,
        height: 140,
        rotation: 0,
        fill: "#4f7cff",
      },
    ],

    selectedId: 1,

    interaction: {
      mode: null,
      offsetX: 0,
      offsetY: 0,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startRotation: 0,
    },
  });

  useEffect(() => {
    const editor = editorRef.current;

    const sketch = (p) => {
      const CANVAS_WIDTH = 1000;
      const CANVAS_HEIGHT = 700;

      const DESIGN_X = 100;
      const DESIGN_Y = 50;
      const DESIGN_WIDTH = 800;
      const DESIGN_HEIGHT = 600;

      // --------------------------------------------------
      // Helpers
      // --------------------------------------------------

      const getSelectedObject = () => {
        return editor.objects.find(
          (object) => object.id === editor.selectedId
        );
      };

      const screenToObject = (object, x, y) => {
        const dx = x - object.x;
        const dy = y - object.y;

        const cos = Math.cos(-object.rotation);
        const sin = Math.sin(-object.rotation);

        return {
          x: dx * cos - dy * sin,
          y: dx * sin + dy * cos,
        };
      };

      const isPointInsideObject = (object, x, y) => {
        const point = screenToObject(object, x, y);

        return (
          point.x >= -object.width / 2 &&
          point.x <= object.width / 2 &&
          point.y >= -object.height / 2 &&
          point.y <= object.height / 2
        );
      };

      const getResizeHandle = (object) => {
        const localX = object.width / 2;
        const localY = object.height / 2;

        const cos = Math.cos(object.rotation);
        const sin = Math.sin(object.rotation);

        return {
          x:
            object.x +
            localX * cos -
            localY * sin,

          y:
            object.y +
            localX * sin +
            localY * cos,
        };
      };

      const getRotateHandle = (object) => {
        const localX = 0;
        const localY = -object.height / 2 - 40;

        const cos = Math.cos(object.rotation);
        const sin = Math.sin(object.rotation);

        return {
          x:
            object.x +
            localX * cos -
            localY * sin,

          y:
            object.y +
            localX * sin +
            localY * cos,
        };
      };

      const distance = (x1, y1, x2, y2) => {
        return Math.sqrt(
          Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2)
        );
      };

      const selectObject = (object) => {
        editor.selectedId = object.id;
        setSelectedId(object.id);
      };

      // --------------------------------------------------
      // Draw object
      // --------------------------------------------------

      const drawObject = (object) => {
        p.push();

        p.translate(object.x, object.y);
        p.rotate(object.rotation);

        p.fill(object.fill);
        p.noStroke();

        if (object.type === "rect") {
          p.rect(
            0,
            0,
            object.width,
            object.height
          );
        }

        if (object.type === "circle") {
          p.ellipse(
            0,
            0,
            object.width,
            object.height
          );
        }

        p.pop();
      };

      // --------------------------------------------------
      // Draw selection
      // --------------------------------------------------

      const drawSelection = (object) => {
        p.push();

        p.translate(object.x, object.y);
        p.rotate(object.rotation);

        // Bounding box
        p.noFill();
        p.stroke(30, 100, 255);
        p.strokeWeight(2);

        p.rect(
          0,
          0,
          object.width + 8,
          object.height + 8
        );

        // Resize handle
        p.fill(255);
        p.stroke(30, 100, 255);

        p.rect(
          object.width / 2,
          object.height / 2,
          12,
          12
        );

        // Rotation line
        p.line(
          0,
          -object.height / 2,
          0,
          -object.height / 2 - 40
        );

        // Rotation handle
        p.fill(255);

        p.circle(
          0,
          -object.height / 2 - 40,
          14
        );

        p.pop();
      };

      // --------------------------------------------------
      // Setup
      // --------------------------------------------------

      p.setup = () => {
        const canvas = p.createCanvas(
          CANVAS_WIDTH,
          CANVAS_HEIGHT
        );

        canvas.parent(canvasRef.current);

        p.rectMode(p.CENTER);

        p.textFont("Arial");

        canvas.elt.style.display = "block";
        canvas.elt.style.maxWidth = "100%";
        canvas.elt.style.height = "auto";
      };

      // --------------------------------------------------
      // Draw
      // --------------------------------------------------

      p.draw = () => {
        p.background(225);

        // Workspace
        p.noStroke();
        p.fill(210);
        p.rect(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
          CANVAS_WIDTH,
          CANVAS_HEIGHT
        );

        // Design canvas
        p.fill(255);
        p.rect(
          DESIGN_X + DESIGN_WIDTH / 2,
          DESIGN_Y + DESIGN_HEIGHT / 2,
          DESIGN_WIDTH,
          DESIGN_HEIGHT
        );

        // Draw objects
        editor.objects.forEach((object) => {
          drawObject(object);
        });

        // Selection
        const selectedObject =
          getSelectedObject();

        if (selectedObject) {
          drawSelection(selectedObject);
        }
      };

      // --------------------------------------------------
      // Mouse pressed
      // --------------------------------------------------

      p.mousePressed = () => {
        const mouseX = p.mouseX;
        const mouseY = p.mouseY;

        const selectedObject =
          getSelectedObject();

        // ------------------------------
        // Rotation handle
        // ------------------------------

        if (selectedObject) {
          const rotateHandle =
            getRotateHandle(selectedObject);

          if (
            distance(
              mouseX,
              mouseY,
              rotateHandle.x,
              rotateHandle.y
            ) < 12
          ) {
            editor.interaction.mode =
              "rotate";

            editor.interaction.startRotation =
              selectedObject.rotation;

            return;
          }
        }

        // ------------------------------
        // Resize handle
        // ------------------------------

        if (selectedObject) {
          const resizeHandle =
            getResizeHandle(selectedObject);

          if (
            distance(
              mouseX,
              mouseY,
              resizeHandle.x,
              resizeHandle.y
            ) < 12
          ) {
            editor.interaction.mode =
              "resize";

            editor.interaction.startX =
              mouseX;

            editor.interaction.startY =
              mouseY;

            editor.interaction.startWidth =
              selectedObject.width;

            editor.interaction.startHeight =
              selectedObject.height;

            return;
          }
        }

        // ------------------------------
        // Object selection
        // ------------------------------

        let clickedObject = null;

        // Reverse order = top object first
        [...editor.objects]
          .reverse()
          .some((object) => {
            if (
              isPointInsideObject(
                object,
                mouseX,
                mouseY
              )
            ) {
              clickedObject = object;
              return true;
            }

            return false;
          });

        if (clickedObject) {
          selectObject(clickedObject);

          editor.interaction.mode =
            "drag";

          editor.interaction.offsetX =
            mouseX - clickedObject.x;

          editor.interaction.offsetY =
            mouseY - clickedObject.y;

          return;
        }

        // Click empty area
        editor.selectedId = null;
        setSelectedId(null);

        editor.interaction.mode = null;
      };

      // --------------------------------------------------
      // Mouse dragged
      // --------------------------------------------------

      p.mouseDragged = () => {
        const object =
          getSelectedObject();

        if (!object) return;

        const mode =
          editor.interaction.mode;

        // ------------------------------
        // Drag
        // ------------------------------

        if (mode === "drag") {
          object.x =
            p.mouseX -
            editor.interaction.offsetX;

          object.y =
            p.mouseY -
            editor.interaction.offsetY;
        }

        // ------------------------------
        // Resize
        // ------------------------------

        if (mode === "resize") {
          const localPoint =
            screenToObject(
              object,
              p.mouseX,
              p.mouseY
            );

          object.width = Math.max(
            40,
            (localPoint.x +
              object.width / 2) *
              2
          );

          object.height = Math.max(
            40,
            (localPoint.y +
              object.height / 2) *
              2
          );
        }

        // ------------------------------
        // Rotate
        // ------------------------------

        if (mode === "rotate") {
          const angle = Math.atan2(
            p.mouseY - object.y,
            p.mouseX - object.x
          );

          object.rotation =
            angle + Math.PI / 2;
        }
      };

      // --------------------------------------------------
      // Mouse released
      // --------------------------------------------------

      p.mouseReleased = () => {
        editor.interaction.mode = null;
      };

      // --------------------------------------------------
      // Double click
      // --------------------------------------------------

      p.doubleClicked = () => {
        const object =
          getSelectedObject();

        if (object) {
          console.log(
            "Double clicked:",
            object
          );
        }
      };
    };

    const instance = new p5(sketch);

    // --------------------------------------------------
    // Keyboard controls
    // --------------------------------------------------

    const handleKeyDown = (event) => {
      if (
        event.key === "Delete" ||
        event.key === "Backspace"
      ) {
        const selectedId =
          editor.selectedId;

        if (selectedId === null) return;

        editor.objects =
          editor.objects.filter(
            (object) =>
              object.id !== selectedId
          );

        editor.selectedId = null;

        setSelectedId(null);
      }

      // Escape
      if (event.key === "Escape") {
        editor.selectedId = null;
        setSelectedId(null);
      }

      // Arrow movement
      const object =
        editor.objects.find(
          (item) =>
            item.id === editor.selectedId
        );

      if (!object) return;

      const step = event.shiftKey ? 10 : 1;

      if (event.key === "ArrowLeft") {
        object.x -= step;
      }

      if (event.key === "ArrowRight") {
        object.x += step;
      }

      if (event.key === "ArrowUp") {
        object.y -= step;
      }

      if (event.key === "ArrowDown") {
        object.y += step;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      instance.remove();

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // --------------------------------------------------
  // Add rectangle
  // --------------------------------------------------

  const addRectangle = () => {
    const editor = editorRef.current;

    const newObject = {
      id: Date.now(),
      type: "rect",
      x: 500,
      y: 350,
      width: 180,
      height: 120,
      rotation: 0,
      fill: "#ff5c5c",
    };

    editor.objects.push(newObject);

    editor.selectedId = newObject.id;

    setSelectedId(newObject.id);
  };

  // --------------------------------------------------
  // Add circle
  // --------------------------------------------------

  const addCircle = () => {
    const editor = editorRef.current;

    const newObject = {
      id: Date.now(),
      type: "circle",
      x: 500,
      y: 350,
      width: 140,
      height: 140,
      rotation: 0,
      fill: "#38b56b",
    };

    editor.objects.push(newObject);

    editor.selectedId = newObject.id;

    setSelectedId(newObject.id);
  };

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const deleteSelected = () => {
    const editor = editorRef.current;

    if (editor.selectedId === null) {
      return;
    }

    editor.objects =
      editor.objects.filter(
        (object) =>
          object.id !== editor.selectedId
      );

    editor.selectedId = null;

    setSelectedId(null);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#181818",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Toolbar */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <button onClick={addRectangle}>
          Add Rectangle
        </button>

        <button onClick={addCircle}>
          Add Circle
        </button>

        <button onClick={deleteSelected}>
          Delete
        </button>

        <div
          style={{
            color: "white",
            marginLeft: "20px",
            fontSize: "14px",
          }}
        >
          {selectedId
            ? `Selected: ${selectedId}`
            : "Nothing selected"}
        </div>
      </div>

      {/* Canvas */}

      <div
        ref={canvasRef}
        style={{
          width: "100%",
          overflow: "auto",
        }}
      />
    </div>
  );
}