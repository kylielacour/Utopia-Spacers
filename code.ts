// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

interface UtopiaStep {
  name: string;
  min: number;
  max: number;
}

interface FigmaVariable {
  name: string;
  value: number;
}

interface FigmaConfig {
  mode: string;
  variables: FigmaVariable[];
}

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg: {
  type: "create-variables" | "cancel";
  url: string;
}) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-variables") {
    // https://utopia.fyi/space/calculator/?c=320,18,1.2,1440,20,1.25,5,2,1440-375-768-2560&s=0.66|0.22,1.2|4|5,s-l|m-xl&g=m,l,xl,10
    // https://utopia.fyi/space/calculator/?c=320,18,1.2,2560,21,1.25,5,2,1442-375-768-2560&s=0.66%7C0.22%7C0.22,1.2%7C4%7C5%7C6%7C7%7C8%7C10,s-l%7Cm-xl%7C2xs-2xl&g=m,l,xl,10
    // https://utopia.fyi/space/calculator/?c=320,18,1.2,2560,21,1.25,5,2,1441-375-768-2560&s=0.66|0.22|0.22,1.2|4|5|6|7|8|10,s-l|m-xl|2xs-2xl&g=m,l,xl,10

    // let oldMinWidth = figma.root.getPluginData("minWidth");
    // let oldMaxWidth = figma.root.getPluginData("maxWidth");
    // let oldModeArrayStrings = figma.root.getPluginData("modeArrayStrings");
    // let oldNegArray = figma.root.getPluginData("negArray");
    // let oldPosArray = figma.root.getPluginData("posArray");
    // let oldCustomStepArray = figma.root.getPluginData("customStepArray");
    // let oldMinFontSize = figma.root.getPluginData("oldMinFontSize");
    // let oldMaxFontSize = figma.root.getPluginData("oldMaxFontSize");

    let rawUrl = msg.url;
    let url = rawUrl.replace(/%7C/gi, "|");

    // parse base values and assign variables
    let baseStart = url.indexOf("c=") + 2;
    let baseEnd = url.indexOf("s=") - 1;
    const baseValues = url.slice(baseStart, baseEnd).split(","); // [320, 18, 1.2, 1440, 20, 1.25, 5, 2, 1440-375-768-2560]

    let multiplierStart = url.indexOf("s=") + 2;
    let multiplierEnd = url.indexOf("g=") - 1;
    const multiplierValues = url
      .slice(multiplierStart, multiplierEnd)
      .split(","); // [0.66|0.22, 1.2|4|5, s-l|m-xl]

    if (!baseValues) throw new Error("No base values found");
    if (!multiplierValues) throw new Error("No multiplier values found");

    const minWidth = parseInt(baseValues[0]); // 320
    const minFontSize = parseInt(baseValues[1]); // 18
    const maxWidth = parseInt(baseValues[3]); // 1440
    const maxFontSize = parseInt(baseValues[4]); // 20
    const modes = baseValues[8].split("-").map(Number); // [1440, 375, 768, 2560]

    const negArray = multiplierValues[0].split("|").map(Number); // [0.66, 0.22]
    negArray.reverse();
    const posArray = multiplierValues[1].split("|").map(Number); // [1.2, 4, 5]
    const customStepArray = multiplierValues[2].split("|"); // ['s-l', 'm-xl']

    // Store Info
    figma.root.setPluginData("minWidth", minWidth.toString());
    figma.root.setPluginData("maxWidth", maxWidth.toString());
    figma.root.setPluginData("modeArrayStrings", modes.toString());
    figma.root.setPluginData("negArray", negArray.toString());
    figma.root.setPluginData("posArray", posArray.toString());
    figma.root.setPluginData("customStepArray", customStepArray.toString());
    figma.root.setPluginData("minFontSize", minFontSize.toString());
    figma.root.setPluginData("maxFontSize", maxFontSize.toString());

    // CALCULATE UTOPIA VALUES FROM URL AND PLACE IN OBJECTS IN ARRAYS —————————————————————————————————————————————————————

    // Utopia root system variables and math
    let rootValues: UtopiaStep[] = [];
    let stepSizeValues: UtopiaStep[] = [];
    let customSizeValues: UtopiaStep[] = [];
    let masterVariablesArray: FigmaConfig[] = []; // { mode: '375', variables: { name: 'xs', value: 12} }

    // For loop to create root values using the pos and neg arrays
    negArray.forEach((multiplier, i) =>
      rootValues.push({
        name: negSizeLookup(i),
        min: Math.round(minFontSize * multiplier),
        max: Math.round(maxFontSize * multiplier),
      })
    );

    // "s" always has a multiplier of 1
    rootValues.push({ name: "s", min: minFontSize, max: maxFontSize });

    posArray.forEach((multiplier, i) =>
      rootValues.push({
        name: posSizeLookup(i),
        min: Math.round(minFontSize * multiplier),
        max: Math.round(maxFontSize * multiplier),
      })
    );

    // Sorts objects from small to large
    // (AB) Not necessarily guaranteed to be sorted by min value
    // rootValues.sort((a, b) => a.min - b.min);

    // Find which index number "m" is in array
    const mIndex = rootValues.findIndex((step) => step.name === "m");
    // Sort everything before "m" backwards
    const sortBetween = (
      rootValues: UtopiaStep[],
      start: number,
      end: number
    ) => {
      const part = rootValues.splice(start, end - start);
      part.sort((b, a) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }
        // names must be equal
        return 0;
      });
      rootValues.splice(start, 0, ...part);
    };
    // sortBetween(rootValues, 0, mIndex);

    // Create step size values, e.g. xs-s, s-m, m-l, l-xl, etc.
    rootValues.forEach((rootValue, i, rootValues) => {
      if (i === rootValues.length - 1) return; // Skip last item (no next item)
      let nextRootValue = rootValues[i + 1];
      stepSizeValues.push({
        name: rootValue.name + "-" + nextRootValue.name,
        min: rootValue.min,
        max: nextRootValue.max,
      });
    });

    // Create custom step size values, e.g. xs-l, m-xl, etc.
    customStepArray.forEach((customStep) => {
      // For each custom step, grab the name (s-l), split it, and get the min/max values
      let startSize = customStep.split("-")[0];
      let endSize = customStep.split("-")[1];
      let customMin = rootValues.find(
        (rootValue) => rootValue.name === startSize
      )?.min;
      let customMax = rootValues.find(
        (rootValue) => rootValue.name === endSize
      )?.max;

      if (customMin && customMax) {
        customSizeValues.push({
          name: customStep,
          min: customMin,
          max: customMax,
        });
      }
    });

    // For each mode, calculate the values for each variable type
    modes.forEach((mode) => {
      let modeRootValues = rootValues.map((rootValue) =>
        calculateModeValues(rootValue, mode)
      );

      let modeStepValues = stepSizeValues.map((stepSizeValue) =>
        calculateModeValues(stepSizeValue, mode)
      );

      let modeCustomStepValues = customSizeValues.map((customSizeValue) =>
        calculateModeValues(customSizeValue, mode)
      );

      masterVariablesArray.push({
        mode: mode.toString(),
        variables: [
          ...modeRootValues,
          ...modeStepValues,
          ...modeCustomStepValues,
        ],
      });
    });

    // CREATE COLLECTION, MODES, & VARIABLES ——————————————————————————————————————————————————————————————————————————————————————————

    const allCollections = figma.variables.getLocalVariableCollections();
    let existingCollection = allCollections.find((collection) =>
      collection.name.includes("Utopia Spacers")
    );
    let utopiaCollection: VariableCollection;
    // Check if "Utopia Spacers" collection already exists. If not, create it and populate modes.
    if (!existingCollection) {
      utopiaCollection =
        figma.variables.createVariableCollection("Utopia Spacers");
      //add modes from modeArray except first mode
      for (let i = 1; i < modes.length; i++) {
        utopiaCollection.addMode(modes[i].toString());
      }
      utopiaCollection.renameMode(
        utopiaCollection.modes[0].modeId,
        modes[0].toString()
      ); //renames first mode (Mode 1) to first modeArray item name
    } else {
      utopiaCollection = existingCollection;
    }

    // Get the existing local variables
    let localVariables = figma.variables.getLocalVariables("FLOAT"); // filters local variables by the 'FLOAT' type

    // For every mode
    masterVariablesArray.forEach((config) => {
      // For every variable in the mode
      config.variables.forEach((variable) => {
        // Get the mode that was created in Figma
        let collectionMode = utopiaCollection.modes.find(
          (mode) => mode.name === config.mode
        );
        if (!collectionMode)
          throw new Error(`No mode found for mode ${config.mode}`);

        // Check for existing variable
        let existingVariable = localVariables.find(
          (localVariable) => localVariable.name === variable.name
        );
        if (existingVariable) {
          // Update the variable if it already exists
          existingVariable.setValueForMode(
            collectionMode.modeId,
            variable.value
          );
        } else {
          // Otherwise create a new variable
          let token = figma.variables.createVariable(
            variable.name,
            utopiaCollection.id,
            "FLOAT"
          );

          token.setVariableCodeSyntax("WEB", `var(--space-${variable.name})`);

          token.setValueForMode(collectionMode.modeId, variable.value);

          // Refetch the variables to include the newly created one
          localVariables = figma.variables.getLocalVariables("FLOAT");
        }
      });
    });

    // Delete unused variables ————————————————————————————————————————————————————————————————————————————————————————————————————————————

    // const newLocalVariables = figma.variables.getLocalVariables('FLOAT');
    // // Gets only variables in the Utopia Spacers collection
    // const utopiaVariables = newLocalVariables.filter((newLocalVariables) => {
    //   return newLocalVariables.variableCollectionId === collection.id;
    // });

    // // Loop through filtered variables, remove any that have a name match from the utopiaVariables array
    // for (let i = 0; i < utopiaVariables.length; i++) {
    //   for (let x = 0; x < masterVariablesArray[0].variables.length; x++) {
    //     if (utopiaVariables[i].name === masterVariablesArray[0].variables[x].name) {
    //       utopiaVariables.splice(i, 1);
    //     }
    //   }
    // }
    // // Loop through new utopiaVariables and remove each one from Figma
    // for (let i = 0; i < utopiaVariables.length; i++) {
    //   utopiaVariables[i].remove();
    // }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();

    // FUNCTIONS ——————————————————————————————————————————————————————————————————————————————————————————————

    // gets string name of root spacer size from negArray[napple]
    function negSizeLookup(napple: number) {
      let distanceFromXs = negArray.length - napple;
      if (distanceFromXs === 1) {
        return "xs";
      } else {
        let strapon = distanceFromXs;
        let bapple = strapon.toString();
        return (bapple += "xs");
      }
    }

    // gets string name of root spacer size from posArray[napple]
    function posSizeLookup(napple: number) {
      if (napple === 0) {
        return "m";
      } else if (napple === 1) {
        return "l";
      } else if (napple === 2) {
        return "xl";
      } else {
        let strapon = napple - 1;
        let bapple = strapon.toString();
        return (bapple += "xl");
      }
    }

    // Returns calculated variable values based on mode as fluidBp
    function calculateModeValues(
      variable: UtopiaStep,
      mode: number
    ): FigmaVariable {
      let fluidBp = (mode - minWidth) / (maxWidth - minWidth);
      if (fluidBp > 1) {
        fluidBp = 1;
      }
      return {
        name: variable.name,
        value: Math.round(
          variable.min + (variable.max - variable.min) * fluidBp
        ),
      };
    }
  }
};
