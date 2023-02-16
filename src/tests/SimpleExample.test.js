import { expect, test, it } from "vitest";
import Dropdown__SvelteComponent_ from "$lib/dropdown.svelte";
import {render} from '@testing-library/svelte'

const user = {
    name : 'Matt',
    age: 22,
}

test('Matt is 22', () => {
    expect(user.name).toBe('Matt');
    expect(user.age).toBe(22)
});

it('displays something', () => {
    render(Dropdown__SvelteComponent_, {OptionList : ['Option1', 'Option2', 'Option3'], Option:'Option1'})
})