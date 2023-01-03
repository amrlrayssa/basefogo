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
    getTotalTime,
    displayTime,
    checkPhaseContinuity,
    setTimeForNextPhase,
    rotateActorUTurn
} from '../../helpers/Util'
import {editor,readOnlyState} from '../../components/global/editor'
import { parseCode } from '../level1Parser'

const scene = new THREE.Scene()

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

const objective = new THREE.Object3D()
var crystalModelPath = new URL('../../../assets/models/crystal.obj',import.meta.url).toString()
var crystalTexturePath = new URL('../../../assets/textures/crystal.jpg',import.meta.url).toString()
loadOBJFile(objective,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective.rotateX(degreeToRadians(-90))
objective.position.set(gridMapHelper.getGlobalXPositionFromCoord(8),0.0,gridMapHelper.getGlobalZPositionFromCoord(0))

const boxGeometry1 = new THREE.BoxGeometry(14,2,2)
const boxGeometry2 = new THREE.BoxGeometry(16,2,2)
const boxGeometry3 = new THREE.BoxGeometry(2,2,4)
const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"})

const box1 = new THREE.Mesh(boxGeometry1,boxMaterial)
const box2 = new THREE.Mesh(boxGeometry2,boxMaterial)
const box3 = new THREE.Mesh(boxGeometry3,boxMaterial)
box1.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.0,gridMapHelper.getGlobalZPositionFromCoord(2))
box2.position.set(gridMapHelper.getGlobalXPositionFromCoord(5.5),1.0,gridMapHelper.getGlobalZPositionFromCoord(4))
box3.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),1.0,gridMapHelper.getGlobalZPositionFromCoord(0.5))

gridMapHelper.addObstacle(2,8,2,2)
gridMapHelper.addObstacle(2,9,4,4)
gridMapHelper.addObstacle(7,7,0,1)

scene.add(ambientLight)
scene.add(mainLight)
scene.add(plane)
scene.add(objective)
scene.add(actor)
scene.add(box1)
scene.add(box2)
scene.add(box3)

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
    let time = getTotalTime(sceneProperties.phaseTimer.getElapsedTime())
    displayTime(time)
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

    if(checkCollision(actor,objective))
    {
        objective.visible = false
        printOnConsole("Cristal coletado com sucesso.")
    }
    else
    {
        printOnConsole("Robô não está sobre o cristal.")
    }
}

function resetLevel()
{
    actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(5))
    actor.getObjectByName('eve').rotation.set(0,0,0)
    actor.rotation.set(0,degreeToRadians(90),0)
    objective.visible = true
}

function winCondition()
{
    if(checkCollision(actor,objective) && !objective.visible)
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
            sceneProperties.phaseTimer.stop()
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

const advanceBtn = document.getElementById('advanceBtn')
advanceBtn.addEventListener('click',function(e){
    e.preventDefault()
    setTimeForNextPhase('/level1/phase7/',getTotalTime(sceneProperties.phaseTimer.getElapsedTime()))
    window.location.href = advanceBtn.href
})

checkPhaseContinuity('/level1/phase6/')
resizeCanvasToDisplaySize(renderer,camera)
sceneProperties.phaseTimer.start()
animate()