import {Engine, Scene, Color4, ArcRotateCamera, Vector3, HemisphericLight ,MeshBuilder, StandardMaterial, Color3} from '@babylonjs/core'
import * as BABYLON from '@babylonjs/core'

console.log(BABYLON.Angle)
export default class App {
    engine: Engine;
    scene: Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas)
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.scene = createScene(this.engine, this.canvas)
        // this.debug(true)
    }

    debug(debugOn: boolean = true) {
        if (debugOn) {
            this.scene.debugLayer.show({ overlay: true });
        } else {
            this.scene.debugLayer.hide();
        }
    }

    run() {
        // this.debug(true);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }



}

var createScene = function (engine: Engine, canvas: HTMLCanvasElement) {
    // 初始化场景
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI * 0.7, Math.PI * 0.4, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const wireframeMaterial = new BABYLON.StandardMaterial("Wireframe Material", scene);
    wireframeMaterial.wireframe = true;

    // Step 1: 我们在 shadertoy 中写的只是 fragment shader，意思是在一个矩形的表面画画
    // 这个矩形由两个三角形拼接而成，就像这里演示的一样
    // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
    // ground.material = wireframeMaterial;

    // Step 2: 除了自行在 fragment shader 中用各种数学计算实现 3d 以外，更常用的方式是通过 vertex shader 操作顶点
    // 但前面只有寥寥几个点，不太好说明，我们可以构建一个由更多点组成的平面，然后使用 vertex shader 任意操作每个点的坐标
    // var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6, subdivisions: 10}, scene);
    // ground.material = wireframeMaterial;

    // Step 3: 我们用 shader material 替换 wireframe material
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6, subdivisions: 30}, scene);
    BABYLON.Effect.ShadersStore["customVertexShader"] = ` 
        precision highp float;
        
        // Attributes
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        
        // Uniforms
        uniform mat4 worldViewProjection;
        uniform float time;

        // Varying
        varying float y;

        void main(void) {
            vec3 p = position;
            y = (sin(time + position.x) + cos(time + position.z)) / 2.;
            p.y = y;
            gl_Position = worldViewProjection * vec4(p, 1.0);
        }
    `
    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
        precision highp float;

        varying float y;
        
        void main(void) {
            float normalizedY = y / 2. + 0.5;
            float var = y / 2. + 0.5;

            gl_FragColor = vec4(1. * var, 1. * var / 2. + 0.5, 1., 1.);
        }
    `

    const shaderMaterial = new BABYLON.ShaderMaterial(
        "shader",
        scene,
        {
            vertex: 'custom',
            fragment: 'custom',
        },
        {
            attributes: ["position", "normal", "uv"],
			uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        },
    );

    shaderMaterial.backFaceCulling = false;
    ground.material = shaderMaterial;

    let time = 0.;
    scene.registerBeforeRender(function() {
        ;(ground.material as BABYLON.ShaderMaterial)!.setFloat('time', time)
        time += 0.1;
    });


    return scene;
};