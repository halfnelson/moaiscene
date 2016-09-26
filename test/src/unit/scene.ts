/// <reference path="../../../typings/index.d.ts" />
import { Scene } from './../../../appSrc/lib/scene'
import { SceneCommand, ConstructCommand, DeleteCommand, PropertySetCommand } from './../../../appSrc/lib/sceneCommands'
import { SceneObject, PropertyValueScalar, SceneObjectReference } from './../../../appSrc/lib/sceneObject'
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
  beforeEach((done) => {
    scene = new Scene();
    return done()
  })

  describe('save/load', () => {
      it('save result should roundtrip via string', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);
      
            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);

            var child = constructTestObject("child")
            child.object.parent = new SceneObjectReference(cmd.object)
            scene.executeCommand(child);

            var secondsetcmd = propertySetCommand(child.object,"childprop",{ complex: "type" })
            scene.executeCommand(secondsetcmd);
            var sceneOut= scene.save();
            var sceneIn = JSON.parse(JSON.stringify(sceneOut));

            expect(sceneIn).to.eql(sceneOut);
            done();
      })

      it('save followed by load should give same objects', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);
      
            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);

            var child = constructTestObject("child")
            child.object.parent = new SceneObjectReference(cmd.object)
            scene.executeCommand(child);

            var secondsetcmd = propertySetCommand(child.object,"childprop",{ complex: "type" })
            scene.executeCommand(secondsetcmd);

            var sceneData= scene.save();
          
            var newScene = new Scene();
            newScene.load(sceneData);

            expect(newScene.objects).to.be.length(2);
            expect(newScene.changeLog).to.be.length(4);

            expect(newScene.save()).to.eql(sceneData);
            done();
      })
  })

  describe('objectByName', () => {
      it('should find object if it exists', ()=> {
          var cmd = constructTestObject("findme");
          scene.executeCommand(cmd);
          expect(scene.objects).contains(cmd.object);

          var found = scene.objectByName("findme");
          expect(found).to.equal(cmd.object);

      })
  })

  describe('executeCommand', () => {
      describe('create command', () => {
          it('should add object to scene objects', (done) => {
                var cmd = constructTestObject();
                scene.executeCommand(cmd);
                expect(scene.objects).contains(cmd.object);
                done();
          })
      })

      describe('set command', () => {
          it('should set property on scene object', (done) => {
                var cmd = constructTestObject();
                scene.executeCommand(cmd);
                
                var setcmd = propertySetCommand(cmd.object,"test",5)
                scene.executeCommand(setcmd);

                expect(scene.objects).to.contain(cmd.object);
                expect(cmd.object.properties).to.have.key('test');
                expect(cmd.object.properties['test']).to.equal(setcmd.newValue);
                done();
          })
      })

       describe('delete command', () => {
          it('should remove scene object', (done) => {
                var cmd = constructTestObject();
                scene.executeCommand(cmd);
                expect(scene.objects).to.contain(cmd.object);


                var delcmd = deleteCommand(cmd.object);
                scene.executeCommand(delcmd);

                expect(scene.objects).to.not.contain(cmd.object);
                done();
          })
      })
  })



  describe('commands for object', () => {
    it('should return empty for non existant object', (done) => {
      var obj = new SceneObject();  
      expect(scene.commandsForObject(obj)).to.be.empty
      done()
    })

    it('should return constructor for new object', (done) => {
      var cmd = constructTestObject();
      scene.executeCommand(cmd);
      expect(scene.commandsForObject(cmd.object)).to.eql([cmd]);
      done()
    })

    it('should return setprop when setprop', (done) => {
      var cmd = constructTestObject();
      scene.executeCommand(cmd);
      scene.clearChangeLog();
      
      var setcmd = propertySetCommand(cmd.object,"test",5)
      scene.executeCommand(setcmd);
      expect(scene.commandsForObject(cmd.object)).to.eql([setcmd]);

      done()
    })

    it('should return delete when deleted', (done) => {
      var cmd = constructTestObject();
      scene.executeCommand(cmd);
      scene.clearChangeLog();
      
      var delcmd = deleteCommand(cmd.object);
      scene.executeCommand(delcmd);

      expect(scene.commandsForObject(cmd.object)).to.eql([delcmd]);
      done()
    })
    
    describe('should be flattened', () => {

        it('delete should obscure construct ', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);
            var delcmd = deleteCommand(cmd.object);
            scene.executeCommand(delcmd);
            expect(scene.commandsForObject(cmd.object)).to.be.empty;
            done()
        })

         it('delete should obscure set ', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);
            scene.clearChangeLog();

            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);
            expect(scene.commandsForObject(cmd.object)).to.eql([setcmd]);

            var delcmd = deleteCommand(cmd.object);
            scene.executeCommand(delcmd);
            expect(scene.commandsForObject(cmd.object)).to.eql([delcmd]);
            done()
        })
        
        it('second set should obscure first set ', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);
            scene.clearChangeLog();

            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test",60)
            scene.executeCommand(secondsetcmd);

            expect(scene.commandsForObject(cmd.object)).to.eql([secondsetcmd]);

            done()
        })

        it('second set should not obscure first set if for different properties ', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);
            scene.clearChangeLog();

            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test2",60)
            scene.executeCommand(secondsetcmd);
            
            expect(scene.commandsForObject(cmd.object)).to.eql([setcmd, secondsetcmd]);
            
            done()
        })

        it('set should not obscure construct ', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);

            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);

            expect(scene.commandsForObject(cmd.object)).to.eql([cmd, setcmd]);
            
            done()
        })

         it('create,set,delete,create,set should return create,set', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);

            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);

            var delcmd = deleteCommand(cmd.object);
            scene.executeCommand(delcmd);

            scene.executeCommand(cmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test",50)
            scene.executeCommand(secondsetcmd);

            expect(scene.commandsForObject(cmd.object)).to.eql([cmd, secondsetcmd]);
            done()
        })

        it('create,set,delete,create,set,delete should return empty set', (done) => {
            var cmd = constructTestObject();
            scene.executeCommand(cmd);

            var setcmd = propertySetCommand(cmd.object,"test",5)
            scene.executeCommand(setcmd);

            var delcmd = deleteCommand(cmd.object);
            scene.executeCommand(delcmd);

            scene.executeCommand(cmd);

            var secondsetcmd = propertySetCommand(cmd.object,"test",50)
            scene.executeCommand(secondsetcmd);

            scene.executeCommand(delcmd);

            expect(scene.commandsForObject(cmd.object)).to.be.empty;
            done()
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