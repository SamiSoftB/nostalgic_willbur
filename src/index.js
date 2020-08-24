import vegaSpec from "./pivotTable";
const vegaEmbed = window.vegaEmbed;
const vega = window.vega;

const chartStruct = {
  columnsData: {
    Bycolumns: [
      { name: "Ship Mode", count: 2, type: "CATEGORICAL" },
      { name: "Speed", count: 4, type: "CATEGORICAL" }
    ],
    Qcolumn: [
      {
        name: "sum(sales)",
        domain: [0, 339135.17],
        type: "QUANTITATIVE"
      }
    ],
    BycolumnsHORIZONTAL: [
      { name: "Gender", count: 3, type: "CATEGORICAL" },
      { name: "Size", count: 6, type: "CATEGORICAL" }
    ],
    selection: { name: "s", type: "SELECTION" },
    idx: { name: "l", type: "LINE" }
  },
  OrderInfo: {
    Length: 2,
    Count: [2, 6],
    Order: ["Ship Mode", "Speed"]
  },
  OrderInfoHOR: {
    Length: 2,
    Count: [3, 7],
    Order: ["Gender", "Size"]
  }
};

const applyChanges = (vegaView, dataSetName, changes) => {
  if (!changes) return;

  const {
    dataToInsert = [],
    dataToRemove = [],
    datumTuplesToModify = []
  } = changes;
  // Create a Vega Changeset and apply the changes in it.
  const changeSet = vega.changeset();
  changeSet.remove(dataToRemove).insert(dataToInsert);
  datumTuplesToModify.forEach((tuple) => {
    changeSet.modify(tuple.datum, tuple.field, tuple.value);
  });

  // ... and use it in the Vega view
  vegaView.change(dataSetName, changeSet);
};
const runVega = async (vegaView, dataSetName) => {
  return await vegaView.runAsync(
    undefined,
    () => {},
    () => vegaView.data(dataSetName)
  );
};

let vegaView;

const handlePan = (_signal, signalValue) => {
  if (signalValue) {
    const {
      xcur,
      catRangeNormalized,
      catRangeNormalizedHORIZONTAL,
      deltaX,
      width,
      ycur,
      deltaY,
      height,
      tableWidth,
      tableHeight
    } = signalValue;

    const span = (x) => {
      return x[1] - x[0];
    };

    const newCatRange = [(xcur[0] + deltaX[0]) / width, (xcur[1] + deltaX[1]) / width];

    const newQdom = [(ycur[0] + deltaY[0]) / height, (ycur[1] + deltaY[1]) / height];

    if (
      Number.isFinite(newCatRange[0]) &&
      Number.isFinite(newCatRange[1]) &&
      Number.isFinite(newQdom[0]) &&
      Number.isFinite(newQdom[1])
    ) {
      const currentData = vegaView.data("userData")[0];
      const columnsData = currentData.columnsData;
      const datumTuplesToModify = [];

      datumTuplesToModify.push({
        datum: currentData,
        field: "columnsData",
        value: {
          ...columnsData,
          Bycolumns: [
            {
              ...columnsData.Bycolumns[0],
              rangeZoom: newCatRange,
              zoomed: true
            }
          ],
          Qcolumn: [
            { ...columnsData.Qcolumn[0], domainZoom: newQdom, zoomed: true }
          ],
          operation: "panning"
        }
      });

      applyChanges(vegaView, "userData", { datumTuplesToModify });
      runVega(vegaView, "userData");
    }
  }
};

document.getElementById("app").innerHTML = `<div id="vega-container"></div>`;

vegaEmbed("#vega-container", vegaSpec(400, 500, chartStruct), {
  mode: "vega"
})
  .then((result) => {
    // add bar selection handler
    // see: https://vega.github.io/vega/docs/api/view/

    vegaView = result.view;

    result.view.addSignalListener("panObj", handlePan);
  })
  .catch((error) => {
    console.error("vega:error", error);
  });
