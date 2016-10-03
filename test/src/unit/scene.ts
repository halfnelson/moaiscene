/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
import { Scene } from './../../../appSrc/lib/scene'
import { SceneCommand, ConstructCommand, DeleteCommand, PropertySetCommand } from './../../../appSrc/lib/sceneCommands'
import { SceneObject, PropertyValueScalar, SceneObjectReference } from './../../../appSrc/lib/sceneObject'
import { SceneEngines } from './../../../appSrc/lib/sceneEngines'
import './../../../appSrc/lib/engines/base/baseEngine'
import { expect } from 'chai'
//const expect = require('chai').expect


function constructTestObject(name: string = "testObject") {
    var a = new ConstructCommand();
    a.object = new SceneObject();
    a.object.parent = null;
    a.object.name = name;
    a.object.type = "MOAIProp";
    return a;
}

function propertySetCommand(object: SceneObject, propname: string, value: any) {
    var a = new PropertySetCommand();
    a.object = object;
    a.propertyName = propname;
    a.newValue = new PropertyValueScalar(value);
    return a;
}

function deleteCommand(object: SceneObject) {
    var a = new DeleteCommand();
    a.object = object;
    return a;
}

describe('(unit) Scene', () => {
  var scene: Scene;
  // Before test suite
  before((done) => {
    return done()
  })

  // Before each of the tests
  beforeEach(async function() {
        scene = Scene.InitWithEngine(await SceneEngines.engineByName('base'));
  })

  describe('save/load', () => {
      it('save result should roundtrip via string', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);
      
            var setcmd = propertySetCommand(cmd.object,"test",5)
            await  scene.executeCommand(setcmd);

            var child = constructTestObject("child")
            child.object.parent = cmd.object;
            await  scene.executeCommand(child);

            var secondsetcmd = propertySetCommand(child.object,"childprop",{ complex: "type" })
            await scene.executeCommand(secondsetcmd);
            
            var sceneOut= scene.save();
            var sceneIn = JSON.parse(JSON.stringify(sceneOut));

            expect(sceneIn).to.eql(sceneOut);
      })

      it('save followed by load should give same objects', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);
      
            var setcmd = propertySetCommand(cmd.object,"test",5)
            await scene.executeCommand(setcmd);

            var child = constructTestObject("child")
            child.object.parent = cmd.object;
            await scene.executeCommand(child);

            var secondsetcmd = propertySetCommand(child.object,"childprop",{ complex: "type" })
            await scene.executeCommand(secondsetcmd);

            var sceneData = scene.save();
            
            var s =  Scene.InitWithEngine(await SceneEngines.engineByName('base'));
            await s.load(sceneData);
            expect(s.changeLog).to.be.length(4);
            expect(s.save()).to.eql(sceneData);
        })
  })

  describe('objectByName', () => {
      it('should find object if it exists', async function() {
          var cmd = constructTestObject("findme");
          await scene.executeCommand(cmd);
          
          var found = scene.objectByName("findme");
          expect(found).to.equal(cmd.object);

      })
  })

  describe('executeCommand', () => {
      describe('create command', () => {
          it('should add object to scene objects', async function() {
                var cmd = constructTestObject();
                await scene.executeCommand(cmd);
                expect(scene.sceneTree.childrenOf(null)).contains(cmd.object);
          })
      })

      describe('set command', () => {
          it('should set property on scene object', async function () {
                var cmd = constructTestObject();
                await scene.executeCommand(cmd);
                
                var setcmd = propertySetCommand(cmd.object,"test",5)
                await scene.executeCommand(setcmd);

                expect(scene.sceneTree.childrenOf(null)).to.contain(cmd.object);
                expect(cmd.object.properties).to.have.key('test');
                expect(cmd.object.properties['test']).to.equal(setcmd.newValue);
                
          })
      })

       describe('delete command', () => {
          it('should remove scene object', async function() {
                var cmd = constructTestObject();
                await scene.executeCommand(cmd);
                expect(scene.sceneTree.childrenOf(null)).to.contain(cmd.object);


                var delcmd = deleteCommand(cmd.object);
                await scene.executeCommand(delcmd);

                expect(scene.sceneTree.childrenOf(null)).to.not.contain(cmd.object);
          })
      })
  })



  describe('commands for object', () => {
    it('should return empty for non existant object', () => {
      var obj = new SceneObject();  
      expect(scene.commandsForObject(obj)).to.be.empty
    })

    it('should return constructor for new object', async function() {
      var cmd = constructTestObject();
      await scene.executeCommand(cmd);
      expect(scene.commandsForObject(cmd.object)).to.eql([cmd]);
    })

    it('should return setprop when setprop', async function() {
      var cmd = constructTestObject();
      await scene.executeCommand(cmd);
      scene.clearChangeLog();
      
      var setcmd = propertySetCommand(cmd.object,"test",5)
      await scene.executeCommand(setcmd);
      expect(scene.commandsForObject(cmd.object)).to.eql([setcmd]);

    })

    it('should return delete when deleted', async function() {
      var cmd = constructTestObject();
      await scene.executeCommand(cmd);
      scene.clearChangeLog();
      
      var delcmd = deleteCommand(cmd.object);
      await scene.executeCommand(delcmd);

      expect(scene.commandsForObject(cmd.object)).to.eql([delcmd]);
    })
    
    describe('should be flattened', () => {

        it('delete should obscure construct ', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);
            var delcmd = deleteCommand(cmd.object);
            await scene.executeCommand(delcmd);
            expect(scene.commandsForObject(cmd.object)).to.be.empty;
        })

         it('delete should obscure set ', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);
            scene.clearChangeLog();

            var setcmd = propertySetCommand(cmd.object,"test",5)
            await scene.executeCommand(setcmd);
            expect(scene.commandsForObject(cmd.object)).to.eql([setcmd]);

            var delcmd = deleteCommand(cmd.object);
            await scene.executeCommand(delcmd);
            expect(scene.commandsForObject(cmd.object)).to.eql([delcmd]);
        })
        
        it('second set should obscure first set ', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);
            scene.clearChangeLog();

            var setcmd = propertySetCommand(cmd.object,"test",5)
            await scene.executeCommand(setcmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test",60)
            await scene.executeCommand(secondsetcmd);

            expect(scene.commandsForObject(cmd.object)).to.eql([secondsetcmd]);
            
        })

        it('second set should not obscure first set if for different properties ', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);
            scene.clearChangeLog();

            var setcmd = propertySetCommand(cmd.object,"test",5)
            await scene.executeCommand(setcmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test2",60)
            await scene.executeCommand(secondsetcmd);
            
            expect(scene.commandsForObject(cmd.object)).to.eql([setcmd, secondsetcmd]);
        })

        it('set should not obscure construct ', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);

            var setcmd = propertySetCommand(cmd.object,"test",5)
            await scene.executeCommand(setcmd);

            expect(scene.commandsForObject(cmd.object)).to.eql([cmd, setcmd]);
        })

         it('create,set,delete,create,set should return create,set', async function() {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);

            var setcmd = propertySetCommand(cmd.object,"test",5)
            await scene.executeCommand(setcmd);

            var delcmd = deleteCommand(cmd.object);
            await scene.executeCommand(delcmd);

            await scene.executeCommand(cmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test",50)
            await scene.executeCommand(secondsetcmd);

            expect(scene.commandsForObject(cmd.object)).to.eql([cmd, secondsetcmd]);
           
        })

        it('create,set,delete,create,set,delete should return empty set', async function () {
            var cmd = constructTestObject();
            await scene.executeCommand(cmd);

            var setcmd = propertySetCommand(cmd.object,"test",5)
            await scene.executeCommand(setcmd);

            var delcmd = deleteCommand(cmd.object);
            await scene.executeCommand(delcmd);

            await scene.executeCommand(cmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test",50)
            await scene.executeCommand(secondsetcmd);

            await scene.executeCommand(delcmd);

            expect(scene.commandsForObject(cmd.object)).to.be.empty;
        })

    })




  // add other tests...
  })

  // add other features...

  // After each of the tests
  afterEach((done) => {
    done()
  })

  // At the end of all
  after((done) => {
    done()
  })
})