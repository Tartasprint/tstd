import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { Iterateur } from "./iter.ts";

Deno.test("Every: true",()=>{
    const a = [true,true];
    assertEquals(Iterateur.from(a.values()).every(),true)
})

Deno.test("Every: empty",()=>{
    const a: boolean[] = [];
    assertEquals(Iterateur.from(a.values()).every(),true)
})

Deno.test("Every: 1 false",()=>{
    const a: boolean[] = [false];
    assertEquals(Iterateur.from(a.values()).every(),false)
})

Deno.test("Every: false at last",()=>{
    const a: boolean[] = [true, true,false];
    assertEquals(Iterateur.from(a.values()).every(),false)
})

Deno.test("Some: true",()=>{
    const a = [true,true];
    assertEquals(Iterateur.from(a.values()).some(),true)
})

Deno.test("Some: empty",()=>{
    const a: boolean[] = [];
    assertEquals(Iterateur.from(a.values()).some(),false)
})

Deno.test("Some: false",()=>{
    const a: boolean[] = [false,false,false];
    assertEquals(Iterateur.from(a.values()).some(),false)
})

Deno.test("Some: true at last",()=>{
    const a: boolean[] = [false, true,false];
    assertEquals(Iterateur.from(a.values()).some(),true)
})

Deno.test("Collect: Empty", ()=> {
    const a: string[] = [];
    assertEquals(Iterateur.from(a.values()).collect(),a);
})

Deno.test("Collect: Some", ()=> {
    const a = ["a","b","c",3];
    assertEquals(Iterateur.from(a.values()).collect(),a);
})

Deno.test("Map: Empty", ()=> {
    const a = [] as string[];
    assertEquals(Iterateur.from(a.values()).map(i => i.toUpperCase()).collect(),[]);
})

Deno.test("Map: Some strings", ()=> {
    assertEquals(
        Iterateur.from(["a","Bc","D"].values()).map(i => i.toUpperCase()).collect(),
        ["A","BC","D"]);
})

Deno.test("Map: Some numbers", ()=> {
    assertEquals(
        Iterateur.from([1,2,3].values()).map(i => i*i).collect(),
        [1,4,9]);
})

Deno.test("Filter: Empty", ()=> {
    assertEquals(
        Iterateur.from([].values()).filter(i => i >= 0).collect(),
        []);
})

Deno.test("Filter: positive numbers", ()=> {
    assertEquals(
        Iterateur.from([1,-2,-4,3].values()).filter(i => i >= 0).collect(),
        [1,3]);
})

Deno.test("Filter: positive, ending with negative", ()=> {
    assertEquals(
        Iterateur.from([-1,2,3,-5,5,-6,-7,7,8,-12,-14].values()).filter(i => i >= 0).collect(),
        [2,3,5,7,8]);
})