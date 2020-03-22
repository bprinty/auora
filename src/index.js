/**
 * Main entry point for module
 */


import { Model, Singleton } from './models';
import SqlAdapter from './adapters/sql';
import RestAdapter from './adapters/rest';

export class Reflect {

}

export default {
    Reflect,
    Model,
    Singleton,
}
    
