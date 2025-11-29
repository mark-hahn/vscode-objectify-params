## Objectify Params

[![Tests](https://github.com/mark-hahn/vscode-objectify-params/actions/workflows/tests.yml/badge.svg)](https://github.com/mark-hahn/vscode-objectify-params/actions/workflows/tests.yml)

Automatically refactor JavaScript or TypeScript functions to use object parameters instead of multiple positional parameters, improving readability and maintainability.

### Features

- **Automatic Refactoring**: Converts function signature and all call sites across your workspace
- **Smart Detection**: Identifies confirmed safe conversions and asks about uncertain cases
- **Preview Mode**: Optional preview dialogs to review each change before applying
- **Workspace-Wide**: Scans and updates all matching files in your project
- **Type-Safe**: Preserves TypeScript types, optional parameters, and function return types

![Objectifying One Parameter List (Delay exaggerated)](images/intro.gif)

*Preview walkthrough is optional.*

### Usage

1. Place your cursor inside a function definition.
2. Right-click and select **"Objectify Params"** or use the Command Palette. You can assign your own hot-key.
3. Review any uncertain conversions in interactive dialogs. In every dialog the cancel button will remove all changes.
4. The extension updates both the function signature and all call sites.

#### Before
```typescript
function createUser(name: string, age = 22) {
  return { name, age };
}

createUser("Alice", 30);
createUser("Bob");
```

#### After
```typescript
function createUser($: { name: string; age?: number }) {
  let { name, age = 22 } = $;
  return { name, age };
}

createUser({ name:"Alice", age:30 });
createUser({ name:"Bob" });
```

### Configuration

Access settings via **File > Preferences > Settings** and search for "Objectify Params":

#### `objectifyParams.1.showPreviews`
- **Type**: `boolean`
- **Default**: `true`
- Show preview dialog for every call conversion (including confirmed safe calls)

#### `objectifyParams.2.highlightDelay`
- **Type**: `number`
- **Default**: `1000`
- **Range**: 0-5000ms
- Duration in ms to show preview highlights. Set to `0` to show only the dialog without delay

#### `objectifyParams.3.objectVariable`
- **Type**: `string`
- **Default**: `$par$`
- Provide a variable name for a single object parameter in the signature. The extension inserts `let { ... } = $par$;` as the first statement inside the function body. If this field is blank then the object is destructured inline in the parameter list.

#### `objectifyParams.4.preserveTypes`
- **Type**: `boolean`
- **Default**: `true`
- When disabled, any extracted TypeScript types are replaced with `any`, dropping type information for both the incoming object and the destructured properties.

#### `objectifyParams.5.exclude`
- **Type**: `string`
- **Default**: `"**/node_modules/**"`
- Space-separated glob patterns to exclude
- Priority over includes

#### `objectifyParams.6.include`
- **Type**: `string`
- **Default**: `"**/*.ts **/*.js"`
- Space-separated glob patterns of files to scan

### Sample Setting Combinations

These demonstrate how `objectVariable` (inline vs `$par$`) and `preserveTypes` (original types vs `any`) change the generated code. All examples start from the same simple function:

```ts
function welcome(name: string, age = 21) {
  console.log(name, age);
}

welcome("Ava", 33);
welcome("Ben");
```

#### 1. `objectVariable: "$par$"` (default), `preserveTypes: true`

- Signature keeps `$par$` and the body destructures on the first line while preserving full TypeScript types.

```ts
function welcome($par$: { name: string; age?: number }) {
  let { name, age = 21 } = $par$;
  console.log(name, age);
}

welcome({ name: "Ava", age: 33 });
welcome({ name: "Ben" });
```

#### 2. `objectVariable: ""`, `preserveTypes: true`

- Parameters destructure inline in the signature, still keeping the extracted types.

```ts
function welcome({ name, age = 21 }: { name: string; age?: number }) {
  console.log(name, age);
}

welcome({ name: "Ava", age: 33 });
welcome({ name: "Ben" });
```

#### 3. `objectVariable: "$par$"`, `preserveTypes: false`

- Keeps `$par$` but drops explicit property types, replacing the object annotation with `any` for quicker editing.

```ts
function welcome($par$: any) {
  let { name, age = 21 } = $par$;
  console.log(name, age);
}

welcome({ name: "Ava", age: 33 });
welcome({ name: "Ben" });
```

#### 4. `objectVariable: ""`, `preserveTypes: false`

- Inline destructuring combined with a simple `any` annotation on the entire parameter.

```ts
function welcome({ name, age = 21 }: any) {
  console.log(name, age);
}

welcome({ name: "Ava", age: 33 });
welcome({ name: "Ben" });
```

### How It Works

1. **Scanning**: Searches your workspace for all references to the function
2. **Classification**: Categorizes calls as:
   - **Confirmed**: Safe to convert automatically
   - **Fuzzy**: Requires user review (name collisions, argument mismatches, etc.)
   - **Incompatible**: Cannot convert (call/apply/bind, spread arguments)
3. **Interactive Review**: Shows dialogs for fuzzy cases where you choose Convert or Skip
4. **Application**: Updates function signature and all approved call sites
5. **Verification**: Highlights the updated function signature

### Supported File Types

- TypeScript (`.ts`, `.tsx`, `.mts`, `.cts`)
- JavaScript (`.js`, `.jsx`, `.mjs`, `.cjs`)
- Vue (`.vue`)
- Svelte (`.svelte`)

### Requirements

- VS Code 1.50.0 or higher
- Works with both JavaScript and TypeScript projects

### Known Limitations

- Cannot convert functions called with `.call()`, `.apply()`, or `.bind()`
- Cannot convert functions called with spread arguments (`...args`)
- Rest parameters must use tuple syntax for type preservation

### Tips

- **Show Previews**: Enable `showPreviews` to review every conversion step-by-step
- **Fast Mode**: Set `highlightDelay` to `0` for instant dialogs without preview delays
- **Selective Scanning**: Adjust `include` patterns to limit scope for faster processing
- **Undo Support**: All changes are applied through VS Code's undo system

### License

MIT

### Links

- [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=eridien.objectify-params)
- [GitHub Repository](https://github.com/mark-hahn/vscode-objectify-params)
- Issues and pull requests welcome

### Author

Mark Hahn (eridien)
