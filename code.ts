// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-variables') {
    // https://utopia.fyi/space/calculator/?c=320,18,1.2,1440,20,1.25,5,2,1440-375-768-2560&s=0.66|0.22,1.2|4|5,s-l|m-xl&g=m,l,xl,10

    const url = msg.url;

    // parse base values and assign variables
    let baseStart = (url.indexOf("c=") + 2);
    let baseEnd = (url.indexOf("s=") - 1);
    const baseValueString = url.slice(baseStart, baseEnd);
    const baseValueArray = baseValueString.split(",");

    const minWidth = parseInt(baseValueArray[0]) ; // 320
    const minFontSize = parseInt(baseValueArray[1]); // 18
    const maxWidth = parseInt(baseValueArray[3]); // 1440
    const maxFontSize = parseInt(baseValueArray[4]); // 20
    const modeArrayStrings = baseValueArray[8].split('-'); // ["1440", "375", "768", "2560"]
    const modeArrayNumbers = modeArrayStrings.map(Number);

    // parse multipliers into 2 arrays and assign variables
    let multiplierStart = (url.indexOf("s=") + 2);
    let multiplierEnd = (url.indexOf("g=") - 1);

    const multiplierValueString = url.slice(multiplierStart, multiplierEnd); // [0.66|0.22,1.2|4|5]
    const multiplierValueArray = multiplierValueString.split(","); // [0.66|0.22], [1.2|4|5]
    const negArray = multiplierValueArray[0].split('|'); // [0.66], [0.22]
    const posArray = multiplierValueArray[1].split('|');
    const customStepArray = multiplierValueArray[multiplierValueArray.length-1].split('|');

    // CALCULATE UTOPIA VALUES FROM URL AND PLACE IN OBJECTS IN ARRAYS —————————————————————————————————————————————————————

    // Utopia root system variables and math
    let rootValues = [{name: 's', min: minFontSize, max: maxFontSize}];
    let stepSizeValues = [];
    let customRootValues: { name: string, min: number, max: number}[] = [];
    let customSizeValues: { name: string, min: number, max: number}[] = [];
    let masterVariablesArray: { mode: string, variables: {}}[] = []; // { mode: 375, variables: { name: xs, value: 12} }

    // For loop to create root values using the pos and neg arrays
    for (let i = 0; i < negArray.length; i++) {
      rootValues.push({
        name: negSizeLookup(i),
        min: minFontSize * parseFloat(negArray[i]),
        max: maxFontSize * parseFloat(negArray[i]),
      });
    }
    for (let i = 0; i < posArray.length; i++) {
      rootValues.push({
        name: posSizeLookup(i),
        min: minFontSize * parseFloat(posArray[i]),
        max: maxFontSize * parseFloat(posArray[i]),
      });
    }

    // Sorts objects from small to large
    rootValues.sort((a, b) => a.min - b.min);

    // For loop to create step size values
    for (let i = 0; i < (rootValues.length - 1); i++) {
      stepSizeValues.push({
        name: rootValues[i].name + '-' + rootValues[i + 1].name,
        min: rootValues[i].min + (rootValues[i + 1].max - rootValues[i].min) * 0,
        max: rootValues[i].min + (rootValues[i + 1].max - rootValues[i].min) * 1
      })
    }
      
    // For loop to grab custom size names and convert them to values
    for (let i = 0; i < customStepArray.length; i++) {
      // For each custom step, grab the name (s-l), split it, and run customStepLookup to get values
      customStepLookup(customStepArray[i].split('-')[0], customStepArray[i].split('-')[1]);
      customSizeValues.push({
        name: customRootValues[i].name,
        min: customRootValues[i].min + (customRootValues[i].max - customRootValues[i].min) * 0,
        max: customRootValues[i].min + (customRootValues[i].max - customRootValues[i].min) * 1
      })
    }
    // Creates T-Shirt size variables for each mode
    for (let a = 0; a < modeArrayNumbers.length; a++) {
      let modeArray = [];
      for (let b = 0; b < rootValues.length; b++) {
        let value = calculateModeValues(rootValues[b], modeArrayNumbers[a]);
        modeArray.push(value);
      }
      masterVariablesArray.push({ mode: modeArrayStrings[a], variables: modeArray });
    }
    // Creates Step size variables for each mode
    for (let a = 0; a < modeArrayNumbers.length; a++) {
      let modeArray: any = [];
      Object.assign(modeArray, masterVariablesArray[a].variables);
      for (let b = 0; b < stepSizeValues.length; b++) {
        let value = calculateModeValues(stepSizeValues[b], modeArrayNumbers[a]);
        modeArray.push(value);
      }
      masterVariablesArray[a]['variables'] = modeArray;
    }
    // Creates Custom size variables for each mode
    for (let a = 0; a < modeArrayNumbers.length; a++) {
      let modeArray: any = [];
      Object.assign(modeArray, masterVariablesArray[a].variables);
      for (let b = 0; b < customSizeValues.length; b++) {
        let value = calculateModeValues(customSizeValues[b], modeArrayNumbers[a]);
        modeArray.push(value);
      }
      masterVariablesArray[a]['variables'] = modeArray;
    }
   // masterVariablesArray[0].variables[6].value;

    // CREATE COLLECTION, MODES, & VARIABLES ——————————————————————————————————————————————————————————————————————————————————————————

    // Check if "Utopia Spacers" collection already exists. If not, create it and populate modes.
    
    const allCollections = figma.variables.getLocalVariableCollections();
    let collection
    let utopiaCollectionObject = allCollections.filter((allCollections) => {
      return allCollections.name.includes('Utopia Spacers');
    });
    if (utopiaCollectionObject.length > 0) {
      collection = utopiaCollectionObject[0];
      figma.notify("Collection already exists!");
    } else {
      collection = figma.variables.createVariableCollection('Utopia Spacers');
      for (let i = 1; i < modeArrayStrings.length; i++) { //add modes from modeArray except first mode
        collection.addMode(modeArrayStrings[i]);
      }
      collection.renameMode(collection.modes[0].modeId, modeArrayStrings[0]); //renames first mode (Mode 1) to first modeArray item name
    }

    // Populate modes with variables

    // In each loop, loop through the # of Variables in the mode
    //@ts-ignore
    for (let x = 0; x < masterVariablesArray[0].variables.length; x++) {
      // Create a number variable for each loop and pull the correct name value
      //@ts-ignore
      let token = figma.variables.createVariable(masterVariablesArray[0].variables[x].name, collection.id, "FLOAT");
      // For each variable created, loop again through the # of Modes
        for (let y = 0; y < masterVariablesArray.length; y++) {
            // Pull the correct values from the object and populate each mode's values
            //@ts-ignore
            token.setValueForMode(collection.modes[y].modeId, masterVariablesArray[y].variables[x].value);
        }
    }


    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();

    // FUNCTIONS ——————————————————————————————————————————————————————————————————————————————————————————————

    // gets string name of root spacer size from negArray[napple]
    function negSizeLookup(napple: number) {
      if (napple !== 0) {
          let strapon = napple + 1;
          let bapple = strapon.toString();
          return bapple += 'xs';
      }
      else {
          return 'xs';
      }
    }

    // gets string name of root spacer size from posArray[napple]
    function posSizeLookup(napple: number) {
      if (napple === 0) {
          return 'm';
      }
      else if (napple === 1) {
          return 'l';
      }
      else if (napple === 2) {
          return 'xl';
      }
      else {
          let strapon = napple - 1;
          let bapple = strapon.toString();
          return bapple += 'xl';
      }
    }

    // Function to match custom step size values with root values using name
    function customStepLookup(param1: string, param2: string) {
      let customMin = 0;
      let customMax = 0;

      for (let i = 0; i < rootValues.length; i++) {
        if (rootValues[i].name == param1) {
          customMin = rootValues[i].min;
        } else if (rootValues[i].name == param2) {
          customMax = rootValues[i].max;
        }
      }
      customRootValues.push({
        name: param1 + '-' + param2,
        min: customMin,
        max: customMax
      })
    }

    // Returns calculated variable values based on mode as fluidBp
    //@ts-ignore
    function calculateModeValues(variable, mode: number) {
      let fluidBp = (mode - minWidth) / (maxWidth - minWidth);
      if (fluidBp > 1) {fluidBp = 1};
      return {
        name: variable.name,
        value: Math.round(variable.min + (variable.max - variable.min) * fluidBp)
      }
    }

  }
}
