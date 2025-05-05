/* utils/fitCanvasToViewport.ts ------------------------------------------------ */
export function fitCanvasToViewport(
   canvas: HTMLCanvasElement,
   logicalW = 1920,
   logicalH = 1080
) {
   const update = () => {
      const scale = Math.min(
         window.innerWidth / logicalW,
         window.innerHeight / logicalH
      );

      /* resize the element for layout */
      canvas.style.width = `${logicalW * scale}px`;
      canvas.style.height = `${logicalH * scale}px`;

      /* 1 logical pixel       == 1 CSS pixel *after* this transform */
      canvas.style.transform = `scale(${scale})`;
      canvas.style.transformOrigin = "top left";

      /* expose the scale everywhere you need it */
      (window as any).__CITY_SCALE = scale;
   };

   update();
   window.addEventListener("resize", update);
   window.addEventListener("orientationchange", update);
}
