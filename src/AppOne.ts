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

    }

    // debug(debugOn: boolean = true) {
    //     if (debugOn) {
    //         this.scene.debugLayer.show({ overlay: true });
    //     } else {
    //         this.scene.debugLayer.hide();
    //     }
    // }

    run() {
        // this.debug(true);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }



}


var createScene = function (engine: Engine, canvas: HTMLCanvasElement) {
    // this is the default code from the playground:

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new Scene(engine);

    scene.clearColor = new Color4(1,1,1,1)

    // This creates and positions a free camera (non-mesh)
    var camera = new ArcRotateCamera("camear1", 0,0,40, new Vector3(0,0,9), scene)
    // var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var hlight = new HemisphericLight("hlight", new Vector3(0, 1, 0), scene);
    // const light = new DirectionalLight("light", new Vector3(0.5, -1, 1), scene)
    // light.position.set(-10, 10, -10)

    // Default intensity is 1. Let's dim the light a small amount
    // light.intensity = 0.5;

    // const skybox = MeshBuilder.CreateBox("skybox", { size : 1000.0 }, scene)
    // const material = new StandardMaterial("skybox", scene)
    // material.emissiveColor = Color3.White()
    // material.backFaceCulling = false
    // material.disableLighting = true
    // skybox.material = material
    // skybox.infiniteDistance = true
    // skybox.position.set(0,0,0)

    // const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100})
    // const gmaterial = new StandardMaterial("grounda", scene)
    // gmaterial.diffuseColor = new Color3(0.8, 0.8, 0.8)
	// // gmaterial.specularColor = Color3.Red();
    // // gmaterial.specularColor = Color3.Black()
    // // gmaterial.ambientColor = Color3.White()
    // // gmaterial.emissiveColor = Color3.White()
    // ground.material = gmaterial
    // ground.position.set(0,-0.5, 0)
    
    const myMaterial = new StandardMaterial("myMaterial", scene);

    myMaterial.diffuseColor = new Color3(0.62, 0.62, 0.62);
    // myMaterial.specularColor = Color3.White();
    // myMaterial.emissiveColor = new Color3(1, 1, 1);
    // myMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const box = MeshBuilder.CreateBox(`box${row}_${col}`, { size: 1 })
            // const box = MeshBuilder.CreateSphere(`box${row}_${col}`, { segments: 10, diameter: 1 }, scene);
            box.position.set(-10 + col * 2, 0, row * 2)
            box.material = myMaterial
        }
    }

    return scene;
};
