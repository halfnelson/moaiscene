/// <reference path="../../../typings/index.d.ts" />
import { Scene } from './../../../appSrc/lib/scene'
import { SceneCommand, ConstructCommand, DeleteCommand, PropertySetCommand } from './../../../appSrc/lib/sceneCommands'
import { SceneObject, PropertyValueScalar, SceneObjectReference } from './../../../appSrc/lib/sceneObject'
import { expect } from 'chai'
//const expect = require('chai').expect

function testObject(name: string = "testObject") {
    var a = new SceneObject();
    a.parent = null;
    a.name = name;
    a.type = "MOAIProp";
    return a;
}
function constructCommand(object: SceneObject) {
    var a = new ConstructCommand();
    a.object = object;
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

describe('(unit) SceneCommands', () => {

  var so: SceneObject;

  // Before test suite
  before((done) => {
    return done()
  })

  // Before each of the tests
  beforeEach((done) => {
    so = testObject("testObject");
    return done()
  })

  describe('construct Command', () => {
      it('it can serialize basic item', (done) => {
          var c = constructCommand(so);
          var serialized = c.serialize();
          expect(serialized).to.exist;
          expect(serialized.kind).to.equal("construct");
          expect(serialized.name).to.equal(so.name);
          expect(serialized.parent).to.be.null;
          done();
      })

      it('it can serialize a child item', (done) => {
          var c = constructCommand(so);
          var parent = testObject("parent");
          c.object.parent = parent;
          var serialized = c.serialize();
          expect(serialized).to.exist;
          expect(serialized.kind).to.equal("construct");
          expect(serialized.name).to.equal("testObject");
          expect(serialized.parent).to.equal("parent");
          done();
      })

      it('it can deserialize a serialized item', (done) => {
          var c = constructCommand(so);
          var parent = testObject("parent");
          c.object.parent = parent;


         let resolve: (name: string) => SceneObject = name => {
              if (name == "parent") return parent;
              if (name == "parent.testObject") return so; 
              expect.fail("deserialize searched for missing object");
          }

          var serialized = c.serialize();
          var newCmd = ConstructCommand.deserialize(serialized,resolve);
          expect(newCmd).to.eql(c);
          done();
      })
  })


  describe('delete Command', () => {
      it('it can serialize basic item', (done) => {
          var c = deleteCommand(so);
          var serialized = c.serialize();
          expect(serialized).to.exist;
          expect(serialized.kind).to.equal("delete");
          expect(serialized.object).to.equal(so.name);
          done();
      })

      it('it can serialize a child item', (done) => {
          var c = deleteCommand(so);
          var parent = testObject("parent");
          c.object.parent = parent;
          var serialized = c.serialize();
          expect(serialized).to.exist;
          expect(serialized.kind).to.equal("delete");
          expect(serialized.object).to.equal("parent.testObject");
          done();
      })

      it('it can deserialize a serialized item', (done) => {
          var c = deleteCommand(so);
          var parent = testObject("parent");
          c.object.parent = parent;


         let resolve: (name: string) => SceneObject = name => {
              if (name == "parent") return parent;
              if (name == "parent.testObject") return so; 
              expect.fail("deserialize searched for missing object");
          }

          var serialized = c.serialize();
          var newCmd = DeleteCommand.deserialize(serialized,resolve);
          expect(newCmd).to.eql(c);
          done();
      })
  })


 describe('set Command', () => {
      it('it can serialize basic item', (done) => {
          var c = propertySetCommand(so,"test",{deep: true});
          var serialized = c.serialize();
          expect(serialized).to.exist;
          expect(serialized.kind).to.equal("propertySet");
          expect(serialized.propertyName).to.equal("test");
          expect(serialized.object).to.equal("testObject");
          done();
      })

      it('it can serialize a child item', (done) => {
          var c = propertySetCommand(so,"test",{deep: true});
          var parent = testObject("parent");
          c.object.parent =parent;
          var serialized = c.serialize();
          expect(serialized).to.exist;
          expect(serialized.kind).to.equal("propertySet");
          expect(serialized.propertyName).to.equal("test");
          expect(serialized.object).to.equal("parent.testObject");
          done();
      })

      it('it can deserialize a serialized item', (done) => {
          var c = propertySetCommand(so,"test",{deep: true});
          var parent = testObject("parent");
          c.object.parent = parent;


         let resolve: (name: string) => SceneObject = name => {
              if (name == "parent") return parent;
              if (name == "parent.testObject") return so; 
              expect.fail("deserialize searched for missing object");
          }

          var serialized = c.serialize();
          var newCmd = PropertySetCommand.deserialize(serialized,resolve);
          expect(newCmd).to.eql(c);
          done();
      })
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