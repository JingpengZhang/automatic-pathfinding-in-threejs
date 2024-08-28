import { useEffect, useRef } from "react";
import {
  AxesHelper,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const App = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;

      const scene = new Scene();
      const camera = new PerspectiveCamera(
        45,
        canvasWidth / canvasHeight,
        0.1,
        1000
      );
      camera.position.set(3, 3, 3);
      camera.lookAt(0, 0, 0);

      const renderer = new WebGLRenderer();
      renderer.setSize(canvasWidth, canvasHeight);
      canvasRef.current.appendChild(renderer.domElement);

      const control = new OrbitControls(camera, renderer.domElement);

      const axesHelper = new AxesHelper(8);

      scene.add(axesHelper);

      const animate = () => {
        requestAnimationFrame(animate);

        control.update();

        renderer.render(scene, camera);
      };

      animate();

      const box = new Mesh(
        new BoxGeometry(1),
        new MeshBasicMaterial({
          color: 0xffff00,
        })
      );
      scene.add(box);
    }
  }, []);

  return (
    <>
      <div ref={canvasRef} className="h-screen w-screen"></div>
    </>
  );
};

export default App;
