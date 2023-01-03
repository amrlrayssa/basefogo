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
import { parseCode } from '../level2Parser'

const scene = new THREE.Scene()

let extinguisherUses = 1

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
objective1.position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(9))
objective2.position.set(gridMapHelper.getGlobalXPositionFromCoord(9),0.0,gridMapHelper.getGlobalZPositionFromCoord(0))

const boxGeometry = new THREE.BoxGeometry(16,2,2)
const boxGeometry2 = new THREE.BoxGeometry(2,2,6)
const boxGeometry3 = new THREE.BoxGeometry(2,2,8)
const boxGeometry4 = new THREE.BoxGeometry(14,2,2)
const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"})
const box1 = new THREE.Mesh(boxGeometry,boxMaterial)
const box2 = new THREE.Mesh(boxGeometry4,boxMaterial)
const box3 = new THREE.Mesh(boxGeometry2,boxMaterial)
const box4 = new THREE.Mesh(boxGeometry3,boxMaterial)
box1.position.set(gridMapHelper.getGlobalXPositionFromCoord(4.5),1,gridMapHelper.getGlobalZPositionFromCoord(4))
box2.position.set(gridMapHelper.getGlobalXPositionFromCoord(4),1,gridMapHelper.getGlobalZPositionFromCoord(6))
box3.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1,gridMapHelper.getGlobalZPositionFromCoord(8))
box4.position.set(gridMapHelper.getGlobalXPositionFromCoord(8),1,gridMapHelper.getGlobalZPositionFromCoord(1.5))
gridMapHelper.addObstacle(1,8,4,4)
gridMapHelper.addObstacle(1,7,6,6)
gridMapHelper.addObstacle(7,7,7,9)
gridMapHelper.addObstacle(8,8,0,3)

const fireTexPath = new URL('../../../assets/textures/fire.png',import.meta.url).toString()
const fireTex = new THREE.TextureLoader().load(fireTexPath)
const fireClock = new THREE.Clock()
const fireHole = new Fire(fireTex)
const fireHole2 = new Fire(fireTex)
fireHole.scale.set(1.2, 3.0, 1.2)
fireHole2.scale.set(1.2, 3.0, 1.2)
fireHole.position.set(gridMapHelper.getGlobalXPositionFromCoord(9),1.5,gridMapHelper.getGlobalZPositionFromCoord(3))
fireHole2.position.set(gridMapHelper.getGlobalXPositionFromCoord(9),1.5,gridMapHelper.getGlobalZPositionFromCoord(7))
gridMapHelper.addFireHole(9,3)
gridMapHelper.addFireHole(9,7)

scene.add(ambientLight)
scene.add(mainLight)
scene.add(plane)
scene.add(objective1)
scene.add(objective2)
scene.add(actor)
scene.add(box1)
scene.add(box2)
scene.add(box3)
scene.add(box4)
scene.add(fireHole)
scene.add(fireHole2)

function animate() {
    requestAnimationFrame(animate)
    fireHole.update(fireClock)
    fireHole2.update(fireClock)
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
    extinguisherUses = 1
    updateExtinguisherUses()
    actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5))
    actor.rotation.set(0,degreeToRadians(90),0)
    actor.getObjectByName('eve').rotation.set(0,0,0)
    gridMapHelper.restartHoles()
    fireHole.visible = true
    fireHole2.visible = true
    objective1.visible = true
    objective2.visible = true
}

function winCondition()
{
    if(!objective1.visible && !objective2.visible)
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