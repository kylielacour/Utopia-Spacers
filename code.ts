// // This plugin will open a window to prompt the user to enter a number, and
// // it will then create that many rectangles on the screen.

// // This file holds the main code for plugins. Code in this file has access to
// // the *figma document* via the figma global object.
// // You can access browser APIs in the <script> tag inside "ui.html" which has a
// // full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// import { negSizeLookup } from "./functions";
// import { posSizeLookup } from "./functions";

// // This shows the HTML page in "ui.html".
// figma.showUI(__html__);

// // Calls to "parent.postMessage" from within the HTML page will trigger this
// // callback. The callback will be passed the "pluginMessage" property of the
// // posted message.
// figma.ui.onmessage = msg => {
//   // One way of distinguishing between different types of messages sent from
//   // your HTML page is to use an object with a "type" property like this.
//   if (msg.type === 'create-variables') {
//     // https://utopia.fyi/space/calculator/?c=320,18,1.2,1440,20,1.25,5,2,1440-768-2560&s=0.66|0.22,1.2|4|5,s-l&g=m,l,xl,10

    
    
    // REMOVE THESE FUNCTIONS WHEN TESTING FOR REAL
    
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
    //CHANGE URL BACK TO MSG

    //const url = msg.url;
    const url = 'https://utopia.fyi/space/calculator/?c=320,18,1.2,1440,20,1.25,5,2,1440-768-2560&s=0.66|0.22,1.2|4|5,s-l|m-xl&g=m,l,xl,10';

    // parse base values and assign variables
    let baseStart = (url.indexOf("c=") + 2);
    let baseEnd = (url.indexOf("s=") - 1);
    const baseValueString = url.slice(baseStart, baseEnd);
    const baseValueArray = baseValueString.split(",");

    const minWidth = parseInt(baseValueArray[0]) ; // 320
    const minFontSize = parseInt(baseValueArray[1]); // 18
    const maxWidth = parseInt(baseValueArray[3]); // 1440
    const maxFontSize = parseInt(baseValueArray[4]); // 20
    const modeArrayStrings = baseValueArray[8].split('-'); // ["1440", "768", "2560"]
    const modeArrayNumbers = modeArrayStrings.map(Number);

    // parse multipliers into 2 arrays and assign variables
    let multiplierStart = (url.indexOf("s=") + 2);
    let multiplierEnd = (url.indexOf("g=") - 1);

    const multiplierValueString = url.slice(multiplierStart, multiplierEnd); // [0.66|0.22,1.2|4|5]
    const multiplierValueArray = multiplierValueString.split(","); // [0.66|0.22], [1.2|4|5]
    const negArray = multiplierValueArray[0].split('|'); // [0.66], [0.22]
    const posArray = multiplierValueArray[1].split('|');
    const customStepArray = multiplierValueArray[multiplierValueArray.length-1].split('|');

    // Grabs step name string from before or after hyphen for custom steps
    console.log(customStepArray[1].split('-')[0], customStepArray[0].split('-')[1]);

    // Utopia root system variables and math

    let rootValues = [{name: 's', min: minFontSize, max: maxFontSize}];
    let stepSizeValues = [];
    let customStepValues = [];

    // UNFINISHED FROM HERE ON ——————————————————————————————————————————————————————


    // // Use for modes
    //let fluidBp = (modeArrayNumbers[i] - minWidth) / (maxWidth - minWidth);

    // TO DO: Generate values for all the different modes

    // for (let i = 0; i > modeArrayNumbers.length; i++) {

    // THIS IS ALL GOOD

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

      //For loop to create step size values
      for (let i = 0; i < (rootValues.length - 1); i++) {
        stepSizeValues.push({
          name: rootValues[i].name + '-' + rootValues[i + 1].name,
          min: rootValues[i].min + (rootValues[i + 1].max - rootValues[i].min) * 0,
          max: rootValues[i].min + (rootValues[i + 1].max - rootValues[i].min) * 1
        })
      }

      // TO DO: Traverse through rootValues using the custom steps split names to find a match and create custom step values

    // }


    // function createVariables(compSize: number){
    //   let fluidBp = (compSize - minWidth) / (maxWidth - minWidth);

    // }



//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
//   }
// }
