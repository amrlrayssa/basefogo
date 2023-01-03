import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GridMapHelper } from '../../helpers/GridMapHelper'
import 
{
    degreeToRadians,
    resizeCanvasToDisplaySize,
    rotateActorLeft,
    rotateActorRight,
    sceneProperties, 
    translateActorBackward, 
    translateActorFoward,
    printOnConsole,
    loadGLBFile,
    loadOBJFile,
    rotateActorUTurn
} from '../../helpers/Util'
import Fire from '../../helpers/FireObject/Fire'
import {editor,readOnlyState} from '../../components/global/editor'
import { parseCode } from '../../level2/level2Parser'

const scene = new THREE.Scene()

let extinguisherUses = 2

const camera = new THREE.PerspectiveCamera(45, 2, 1, 1000)
camera.position.set(0,15,30)

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("sceneView")})

window.addEventListener( 'resize', function(){
    resizeCanvasToDisplaySize(renderer,camera);
}, false );

const ambientLight = new THREE.HemisphereLight('white','darkslategrey',0.5)

const mainLight = new THREE.DirectionalLight('white',0.7)
mainLight.position.set(2,1,1)

const controls = new OrbitControls(camera, renderer.domElement)

const gridMapHelper = new GridMapHelper()

const plane = gridMapHelper.createGridPlane()

var actorModelPath = new URL('../../../assets/models/eve.glb',import.meta.url).toString()
const actor = new THREE.Object3D()
loadGLBFile(actor,actorModelPath,"eve",2.0)
actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5))
actor.rotateY(degreeToRadians(90))

const objective1 = new THREE.Object3D()
var crystalModelPath = new URL('../../../assets/models/crystal.obj',import.meta.url).toString()
var crystalTexturePath = new URL('../../../assets/textures/crystal.jpg',import.meta.url).toString()
loadOBJFile(objective1,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective1.rotateX(degreeToRadians(-90))
const objective2 = new THREE.Object3D()
loadOBJFile(objective2,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective2.rotateX(degreeToRadians(-90))
const objective3 = new THREE.Object3D()
loadOBJFile(objective3,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective3.rotateX(degreeToRadians(-90))
objective1.position.set(gridMapHelper.getGlobalXPositionFromCoord(3),0.0,gridMapHelper.getGlobalZPositionFromCoord(5))
objective2.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.0,gridMapHelper.getGlobalZPositionFromCoord(5))
objective3.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(5))

const boxGeometry = new THREE.BoxGeometry(2,2,4)
const boxGeometry2 = new THREE.BoxGeometry(2,2,2)
const boxGeometry3 = new THREE.BoxGeometry(2,2,6)
const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"})
const box1 = new THREE.Mesh(boxGeometry,boxMaterial)
const box2 = new THREE.Mesh(boxGeometry,boxMaterial)
const box3 = new THREE.Mesh(boxGeometry,boxMaterial)
const box4 = new THREE.Mesh(boxGeometry,boxMaterial)
const box5 = new THREE.Mesh(boxGeometry,boxMaterial)
const box6 = new THREE.Mesh(boxGeometry2,boxMaterial)
const box7 = new THREE.Mesh(boxGeometry2,boxMaterial)
const box8 = new THREE.Mesh(boxGeometry2,boxMaterial)
const box9 = new THREE.Mesh(boxGeometry2,boxMaterial)
const box10 = new THREE.Mesh(boxGeometry3,boxMaterial)
box1.position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(6.5))
box2.position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(3.5))
box3.position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1,gridMapHelper.getGlobalZPositionFromCoord(0.5))
box4.position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(1.5))
box5.position.set(gridMapHelper.getGlobalXPositionFromCoord(6.5),1,gridMapHelper.getGlobalZPositionFromCoord(2))
box5.rotateY(degreeToRadians(90))
box6.position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(6))
box7.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1,gridMapHelper.getGlobalZPositionFromCoord(6))
box8.position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(4))
box9.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1,gridMapHelper.getGlobalZPositionFromCoord(4))
box10.position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(2))
gridMapHelper.addObstacle(2,2,6,7)
gridMapHelper.addObstacle(2,2,3,4)
gridMapHelper.addObstacle(2,2,0,1)
gridMapHelper.addObstacle(4,4,1,2)
gridMapHelper.addObstacle(6,7,2,2)
gridMapHelper.addObstacle(3,7,2,2)
gridMapHelper.addObstacle(4,4,6,6)
gridMapHelper.addObstacle(6,6,6,6)
gridMapHelper.addObstacle(4,4,4,4)
gridMapHelper.addObstacle(6,6,4,4)

const trapGeometry = new THREE.BoxGeometry(2,1,2)
const trapMaterial = new THREE.MeshLambertMaterial({color: "rgb(255,0,0)"})
const trap1 = new THREE.Mesh(trapGeometry,trapMaterial)
const trap2 = new THREE.Mesh(trapGeometry,trapMaterial)
const trap3 = new THREE.Mesh(trapGeometry,trapMaterial)
const trap4 = new THREE.Mesh(trapGeometry,trapMaterial)
const trap5 = new THREE.Mesh(trapGeometry,trapMaterial)
const trap6 = new THREE.Mesh(trapGeometry,trapMaterial)
const trap7 = new THREE.Mesh(trapGeometry,trapMaterial)
trap1.position.set(gridMapHelper.getGlobalXPositionFromCoord(4),0.5,gridMapHelper.getGlobalZPositionFromCoord(7))
trap2.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.5,gridMapHelper.getGlobalZPositionFromCoord(7))
trap3.position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0.5,gridMapHelper.getGlobalZPositionFromCoord(5))
trap4.position.set(gridMapHelper.getGlobalXPositionFromCoord(4),0.5,gridMapHelper.getGlobalZPositionFromCoord(5))
trap5.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.5,gridMapHelper.getGlobalZPositionFromCoord(5))
trap6.position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0.5,gridMapHelper.getGlobalZPositionFromCoord(5))
trap7.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.5,gridMapHelper.getGlobalZPositionFromCoord(0))
gridMapHelper.addTrap(4,7)
gridMapHelper.addTrap(6,7)
gridMapHelper.addTrap(2,5)
gridMapHelper.addTrap(4,5)
gridMapHelper.addTrap(6,5)
gridMapHelper.addTrap(8,5)
gridMapHelper.addTrap(6,0)

const fireTexPath = new URL('../../../assets/textures/fire.png',import.meta.url).toString()
const fireTex = new THREE.TextureLoader().load(fireTexPath)
const fireClock = new THREE.Clock()
const fireHole = new Fire(fireTex)
const fireHole2 = new Fire(fireTex)
const fireHole3 = new Fire(fireTex)
const fireHole4 = new Fire(fireTex)
const fireHole5 = new Fire(fireTex)
const fireHole6 = new Fire(fireTex)
fireHole.scale.set(1.2, 3.0, 1.2)
fireHole2.scale.set(1.2, 3.0, 1.2)
fireHole3.scale.set(1.2, 3.0, 1.2)
fireHole4.scale.set(1.2, 3.0, 1.2)
fireHole5.scale.set(1.2, 3.0, 1.2)
fireHole6.scale.set(1.2, 3.0, 1.2)
fireHole.position.set(gridMapHelper.getGlobalXPositionFromCoord(3),1.5,gridMapHelper.getGlobalZPositionFromCoord(7))
fireHole2.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.5,gridMapHelper.getGlobalZPositionFromCoord(7))
fireHole3.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1.5,gridMapHelper.getGlobalZPositionFromCoord(7))
fireHole4.position.set(gridMapHelper.getGlobalXPositionFromCoord(3),1.5,gridMapHelper.getGlobalZPositionFromCoord(3))
fireHole5.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.5,gridMapHelper.getGlobalZPositionFromCoord(3))
fireHole6.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1.5,gridMapHelper.getGlobalZPositionFromCoord(3))
gridMapHelper.addFireHole(3,7)
gridMapHelper.addFireHole(5,7)
gridMapHelper.addFireHole(7,7)

scene.add(ambientLight)
scene.add(mainLight)
scene.add(plane)
scene.add(objective1)
scene.add(objective2)
scene.add(objective3)
scene.add(actor)
scene.add(box1)
scene.add(box2)
scene.add(box3)
scene.add(box4)
scene.add(box5)
scene.add(box6)
scene.add(box7)
scene.add(box8)
scene.add(box9)
scene.add(box10)
scene.add(trap1)
scene.add(trap2)
scene.add(trap3)
scene.add(trap4)
scene.add(trap5)
scene.add(trap6)
scene.add(trap7)
scene.add(fireHole)
scene.add(fireHole2)
scene.add(fireHole3)
scene.add(fireHole4)
scene.add(fireHole5)
scene.add(fireHole6)

function animate() {
    requestAnimationFrame(animate)
    fireHole.update(fireClock)
    fireHole2.update(fireClock)
    fireHole3.update(fireClock)
    fireHole4.update(fireClock)
    fireHole5.update(fireClock)
    fireHole6.update(fireClock)
    controls.update()
    renderer.render(scene, camera)
}

async function andarFrente(amount)
{
    await translateActorFoward(actor,amount,gridMapHelper,sceneProperties)
}

async function andarTras(amount)
{
    await translateActorBackward(actor,amount,gridMapHelper,sceneProperties)
}

async function girarDireita()
{
    await rotateActorRight(actor,sceneProperties)
}

async function girarEsquerda()
{
    await rotateActorLeft(actor,sceneProperties)
}

async function darMeiaVolta()
{
    await rotateActorUTurn(actor,sceneProperties)
}

function pegandoFogo()
{
    if(gridMapHelper.detectHole(actor.position) != null)
    {
        return true
    }
    else
    {
        return false
    }
}

function updateExtinguisherUses()
{
    const usesElement = document.getElementById("extinguisherUses")
    usesElement.innerText = `x${extinguisherUses}`
}

function apagarFogoECobrirBuraco()
{
    if(extinguisherUses > 0)
    {
        if(gridMapHelper.detectHole(actor.position) == 0)
        {
            fireHole.visible = false
        }
        else if(gridMapHelper.detectHole(actor.position) == 1)
        {
            fireHole2.visible = false
        }
        else if(gridMapHelper.detectHole(actor.position) == 2)
        {
            fireHole3.visible = false
        }
        else if(gridMapHelper.detectHole(actor.position) == 3)
        {
            fireHole4.visible = false
        }
        else if(gridMapHelper.detectHole(actor.position) == 4)
        {
            fireHole5.visible = false
        }
        else if(gridMapHelper.detectHole(actor.position) == 5)
        {
            fireHole6.visible = false
        }
        gridMapHelper.deactivateHole(actor.position,'fire')
        extinguisherUses--
        updateExtinguisherUses()
    }
    else
    {
        printOnConsole("Estou sem extintores!")
    }
}

function checkCollision(object1,object2)
{
    if(gridMapHelper.getXCoordFromGlobalPosition(object1.position.x) == gridMapHelper.getXCoordFromGlobalPosition(object2.position.x) && gridMapHelper.getZCoordFromGlobalPosition(object1.position.z) == gridMapHelper.getZCoordFromGlobalPosition(object2.position.z))
    {
        return true
    }
    else
    {
        return false
    }
}

function coletarCristal()
{
    if(sceneProperties.cancelExecution)
    {
        return
    }

    if(checkCollision(actor,objective1))
    {
        objective1.visible = false
        printOnConsole("Cristal coletado.")
    }
    else if(checkCollision(actor,objective2))
    {
        objective2.visible = false
        printOnConsole("Cristal coletado.")
    }
    else if(checkCollision(actor,objective3))
    {
        objective3.visible = false
        printOnConsole("Cristal coletado.")
    }
    else
    {
        printOnConsole("Robô não está sobre o cristal.")
    }

    if(!objective1.visible && !objective2.visible)
    {
        printOnConsole("Todos os cristais coletados com sucesso!")
    }
}

function resetLevel()
{
    extinguisherUses = 2
    updateExtinguisherUses()
    actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5))
    actor.rotation.set(0,degreeToRadians(90),0)
    actor.getObjectByName('eve').rotation.set(0,0,0)
    gridMapHelper.restartHoles()
    fireHole.visible = true
    fireHole2.visible = true
    fireHole3.visible = true
    fireHole4.visible = true
    fireHole5.visible = true
    fireHole6.visible = true
    objective1.visible = true
    objective2.visible = true
    objective3.visible = true
}

function winCondition()
{
    if(!objective1.visible && !objective2.visible && !objective3.visible)
    {
        return true
    }
    else
    {
        return false
    }
}

const execBtn = document.getElementById("execute")
execBtn.addEventListener("click",async function(){
    let codeParsed = parseCode(editor.state.doc.toString())
    sceneProperties.cancelExecution = false
    if(codeParsed != null)
    {
        resetLevel()
        document.getElementById("execute").disabled = true
        await eval(codeParsed)
        if(winCondition())
        {
            readOnlyState.doc = editor.state.doc
            editor.setState(readOnlyState)
            document.getElementById('winMessage').classList.remove('invisible')
            document.getElementById('advanceBtn').classList.remove('invisible')
            document.getElementById("reset").disabled = true
        }
        else
        {
            document.getElementById("execute").disabled = false
        }
    }
})

const resetBtn = document.getElementById("reset")
resetBtn.addEventListener("click",function(){
    sceneProperties.cancelExecution = true
    resetLevel()
})

const clsConsoleBtn = document.getElementById("clsConsole")
clsConsoleBtn.addEventListener("click",function(){
    document.getElementById("console-printing").innerHTML = null
})

resizeCanvasToDisplaySize(renderer,camera)
updateExtinguisherUses()
animate()