import test from 'node:test';
import assert from 'node:assert/strict';
import {candidates} from '../netlify/functions/daily-leads.mjs';
test('Discovery only accepts sourced matching nearby businesses and deduplicates',()=>{
 const base={company:'Contractor example',segment:'General Contractor',source:'https://example.test/contact',latitude:34.99,longitude:-90.01};
 const list=candidates([base,base,{...base,company:'Far away',latitude:39},{...base,company:'Wrong type',segment:'Restaurant'},{...base,company:'Missing source',source:''},{...base,company:'No coordinates',latitude:undefined}]);
 assert.equal(list.length,1);assert.equal(list[0].sourceType,'automatic');assert.equal(list[0].phone,'');assert.equal(list[0].email,'');
});
