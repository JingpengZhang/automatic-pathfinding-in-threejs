import { useEffect, useRef } from "react";
import {
  AmbientLight,
  AxesHelper,
  Box3,
  Box3Helper,
  BoxGeometry,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  DRACOLoader,
  GLTFLoader,
  OrbitControls,
} from "three/examples/jsm/Addons.js";

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

      const light = new AmbientLight(0xffffff, 0.9); // soft white light
      scene.add(light);

      const glbLoader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/example/jsm/libs/draco/");
      glbLoader.setDRACOLoader(dracoLoader);

      glbLoader.load("world.glb", (glb) => {
        scene.add(glb.scene);

        // 便利出地板
        glb.scene.traverse((obj) => {
          if (obj.name === "floor") {
            const sceneBox = new Box3();
            sceneBox.setFromObject(obj);
            const helper = new Box3Helper(sceneBox, 0xfff000);
            scene.add(helper);

            // 获取尺寸
            const size = new Vector3();
            sceneBox.getSize(size);
            size.set(
              parseFloat(size.x.toFixed(2)),
              parseFloat(size.y.toFixed(2)),
              parseFloat(size.z.toFixed(2))
            );

            // 网格单位
            const unitLength = 0.5;
            const worldPos = new Vector3();
            obj.getWorldPosition(worldPos);
            // 地面世界y轴坐标
            const zeroY = size.y / 2 + parseFloat(worldPos.y.toFixed(2));

            // 左上角起始点坐标（俯视平面坐标系）
            const startPos = new Vector2(
              parseFloat((-size.x / 2).toFixed(2)),
              parseFloat((-size.z / 2).toFixed(2))
            );
            // 第一块区域中心坐标
            const firstAreaCenterPos = new Vector2(
              parseFloat((startPos.x + unitLength / 2).toFixed(2)),
              parseFloat((startPos.y + unitLength / 2).toFixed(2))
            );

            // 列数
            const columns = Math.ceil(size.x / unitLength);
            // 行数
            const rows = Math.ceil(size.z / unitLength);

            // 循环添加块
            for (let i = 0; i < columns; i++) {
              for (let j = 0; j < rows; j++) {
                const plane = new Mesh(
                  new PlaneGeometry(unitLength, unitLength),
                  new MeshBasicMaterial({
                    color: 0xffff00,
                    wireframe: true,
                  })
                );
                plane.rotateX(-Math.PI / 2);
                plane.position.set(
                  firstAreaCenterPos.x + i * unitLength,
                  zeroY,
                  firstAreaCenterPos.y + j * unitLength
                );
                scene.add(plane);
              }
            }
          }
        });
      });
    }

    return () => {
      if (canvasRef.current) canvasRef.current.innerHTML = "";
    };
  }, []);

  return (
    <>
      <div ref={canvasRef} className="h-screen w-screen"></div>
    </>
  );
};

export default App;
