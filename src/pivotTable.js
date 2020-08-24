const vegaSpec = (width, height, chartStruct) => {
  const typography = {
    IR11: {
      fontFamily: "Arial",
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: 0,
      lineHeight: "13px"
    },
    IB13: {
      fontFamily: "Arial",
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: 0,
      lineHeight: "13px"
    }
  };
  const palette = { base: { 200: "#DFE6ED", 900: "#374B5F" } };
  const columnsData = chartStruct.columnsData;
  const colorField = chartStruct.columnsData.color
    ? chartStruct.columnsData.color.name
    : "PivotedAnasenColumns";

  const colorFieldCategoriesCount = chartStruct.columnsData.color
    ? chartStruct.columnsData.Bycolumns.find((col) => {
        return col.name === colorField;
      }).count
    : chartStruct.columnsData.Qcolumn.length;

  const AxisDataLevels = [];
  const otherAxes = [];
  const orderInfo = chartStruct.OrderInfo;
  const orderInfoLength = orderInfo.Length;

  const otherAxesHorz = [];
  const orderInfoHorz = chartStruct.OrderInfoHOR;
  const orderInfoHorzLength = orderInfoHorz.Length;

  const selectionName = chartStruct.columnsData.selection.name;
  const buildScaleTitle = orderInfo.Order.reduce((acc, orderItem, idx) => {
    return (
      acc +
      (idx !== 0 ? " / " : "") +
      (orderItem === "PivotedAnasenColumns" ? "Columns" : orderItem)
    );
  }, "");

  const scaleLevels = [];

  for (let i = 2; i <= orderInfoLength; i++) {
    AxisDataLevels.push({
      name: `Level${i}AxisData`,
      source: "labels",
      transform: [
        {
          type: "formula",
          as: "ANASENLabels",
          expr: "[slice(datum[0])]"
        },
        {
          type: "aggregate",
          fields: ["ANASENLabels"],
          ops: ["count"],
          groupby: ["ANASENLabels"],
          as: ["GridSize"]
        },
        {
          type: "window",
          ops: ["sum"],
          fields: ["GridSize"],
          as: ["GridSize"]
        }
      ]
    });
    otherAxes.push({
      scale: `xScaleLevel${i}`,
      orient: "top",
      offset: -30 * (orderInfoLength + 1 - (i - 1)), // -30 * (Length + 1 - (i - 1))
      zindex: 0,
      domain: false,
      ticks: false,
      grid: true,
      gridColor: palette.base[200],
      labelPadding: 5, // NAIM Put 8
      labelFont: typography.IR11.fontFamily,
      labelFontSize: typography.IR11.fontSize, //10,
      labelFontWeight: typography.IR11.fontWeight,
      labelLineHeight: typography.IR11.lineHeight, //13, // labelfontsize + 3
      labelColor: palette.base[900],
      labelOverlap: "greedy",
      labelSeparation: 0,
      labelFlush: true,
      labelBound: 5,
      encode: {
        /*domain: {
          update: { x: { value: 0 }, x2: { signal: 'width' } },
        },*/
        labels: {
          interactive: false,
          name: `catAxisLabelsLevel${i}`,
          update: {
            text: {
              signal: "peek(datum.value)"
            },
            x: {
              signal: `
                  (max(0,
                    (if(datum.index===0,
                      0,
                      paddingCatScale.Outer +
                      data('Level${i}AxisData')[round( (datum.index * (data('chartStruct')[0].OrderInfo.Count[${
                orderInfoLength - i
              }] - 1)) - 1)].GridSize - 1/2 * (paddingCatScale.Inner))) *
                    (1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]) +
                    min(width,
                      (paddingCatScale.Outer+data('Level${i}AxisData')[round(datum.index*(data('chartStruct')[0].OrderInfo.Count[${
                orderInfoLength - i
              }]-1))].GridSize -
                      1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]))/2`
            },
            y: { signal: "-15" },
            angle: { signal: "0" },
            baseline: { signal: "'middle'" },
            align: { signal: "'center'" },
            limit: {
              signal: `max(0.000001, (- max(0,
                    if (datum.index===0,
                      0,
                      paddingCatScale.Outer +
                      data('Level${i}AxisData')[round((datum.index * (data('chartStruct')[0].OrderInfo.Count[${
                orderInfoLength - i
              }]-1)) - 1)].GridSize
                      - 1 / 2 * paddingCatScale.Inner) *
                      (1 / ( 2 * paddingCatScale.Outer + N * (1 - paddingCatScale.Inner) + ((N-1) * paddingCatScale.Inner)) ) *
                      span(xRange) + xRange[0]) +
                      min(width,
                        (paddingCatScale.Outer +
                        data('Level${i}AxisData')[round(datum.index * (data('chartStruct')[0].OrderInfo.Count[${
                orderInfoLength - i
              }]-1))].GridSize -
                        1/2 * (paddingCatScale.Inner)) * (1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner))) * span(xRange)+xRange[0])))`
            },
            opacity: [{ signal: "1" }],
            fill: [
              {
                signal: `if((- max(0,(if(datum.index===0,0,paddingCatScale.Outer+data('Level${i}AxisData')[round((datum.index*(data('chartStruct')[0].OrderInfo.Count[${
                  orderInfoLength - i
                }]-1))-1)].GridSize-1/2*(paddingCatScale.Inner))) *(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0])   +   min(width,(paddingCatScale.Outer+data('Level${i}AxisData')[round(datum.index*(data('chartStruct')[0].OrderInfo.Count[${
                  orderInfoLength - i
                }]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]))>10, '${
                  palette.base[900]
                }' ,null)`
              }
            ]
          }
        },
        grid: {
          interactive: false,
          name: `catAxisGridLevel${i}`,
          update: {
            y: { value: -30 },
            y2: { signal: "height+30" },
            x: {
              signal: `(paddingCatScale.Outer+data('Level${i}AxisData')[round(datum.index*(data('chartStruct')[0].OrderInfo.Count[${
                orderInfoLength - i
              }]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]`
            }
          }
        },
        axis: {
          name: `GroupAxisXLevel${i}`,
          interactive: false,
          enter: {
            width: { signal: "min(width,tableWidth)" },
            height: { signal: "-30" },
            clip: { value: false }
          },
          update: {
            width: { signal: "min(width,tableWidth)" },
            height: { signal: "-30" },
            clip: { value: false },
            fill: {
              value: palette.base[i - 1 === 1 ? 50 : (i - 1) * 100]
            },
            stroke: {
              signal: "'transparent'"
              //signal: "if(GroupAxisHoverX.started, GroupAxisHoverX.stroke, 'transparent')",
            },
            strokeWidth: { value: 3 },
            cornerRadius: { value: 5 }
          }
        }
      }
    });
    scaleLevels.push({
      name: `xScaleLevel${i}`,
      type: "band",
      domain: { data: `Level${i}AxisData`, field: "ANASENLabels" },
      range: { signal: "xRange" },
      paddingInner: { signal: "paddingCatScale.Inner" },
      paddingOuter: { signal: "paddingCatScale.Outer" }
    });
  }

  for (let i = 2; i <= orderInfoHorzLength; i++) {
    AxisDataLevels.push({
      name: `Level${i}AxisDataHORIZONTAL`,
      source: "labelsHORIZONTAL",
      transform: [
        {
          type: "formula",
          as: "ANASENLabelsHORIZONTAL",
          expr: "[slice(datum[0])]"
        },
        {
          type: "aggregate",
          fields: ["ANASENLabelsHORIZONTAL"],
          ops: ["count"],
          groupby: ["ANASENLabelsHORIZONTAL"],
          as: ["GridSize"]
        },
        {
          type: "window",
          ops: ["sum"],
          fields: ["GridSize"],
          as: ["GridSize"]
        }
      ]
    });

    otherAxesHorz.push({
      scale: `yScaleLevel${i}`,
      orient: "left",
      offset: -110 * (orderInfoHorzLength - (i - 1)),
      zindex: 0,
      domain: false,
      ticks: false,
      grid: true,
      gridColor: palette.base[200],
      labelPadding: 5, // NAIM Put 8
      labelFont: typography.IR11.fontFamily,
      labelFontSize: typography.IR11.fontSize, //10,
      labelFontWeight: typography.IR11.fontWeight,
      labelLineHeight: typography.IR11.lineHeight, //13, // labelfontsize + 3
      labelColor: palette.base[900],
      labelOverlap: "greedy",
      labelSeparation: 0,
      labelFlush: true,
      labelBound: 5,
      title:
        orderInfoHorz.Order[orderInfoHorzLength - i] === "PivotedAnasenColumns"
          ? "Columns"
          : orderInfoHorz.Order[orderInfoHorzLength - i],
      titleAnchor: "start",
      titleAngle: 0,
      titlePadding: 0,
      titleAlign: "center",
      titleBaseline: "bottom",
      titleFont: typography.IB13.fontFamily,
      titleFontSize: typography.IB13.fontSize, //16,
      titleFontWeight: typography.IB13.fontWeight, //200,
      titleLineHeight: 16, // NAIM : get the value from theme.js
      titleX: -55,
      titleY: 0,
      encode: {
        domain: { update: { y: { value: 0 }, y2: { signal: "height" } } },
        labels: {
          interactive: false,
          name: `catAxisLabelsLevel${i}`,
          update: {
            text: {
              signal: "peek(datum.value)"
            },
            y: {
              signal: `(max(0,(if(datum.index===0,0,paddingCatScale.Outer+data('Level${i}AxisDataHORIZONTAL')[round((datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[${
                orderInfoLength - i
              }]-1))-1)].GridSize-1/2*(paddingCatScale.Inner))) *(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0])   +   min(width,(paddingCatScale.Outer+data('Level${i}AxisDataHORIZONTAL')[round(datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[${
                orderInfoLength - i
              }]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0]))/2`
            },
            angle: { signal: "0" },
            baseline: { signal: "'middle'" },
            align: { signal: "'right'" },
            limit: {
              signal: `100`
            },
            opacity: [{ signal: "1" }],
            fill: [
              {
                signal: `if((- max(0,(if(datum.index===0,0,paddingCatScale.Outer+data('Level${i}AxisDataHORIZONTAL')[round((datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[${
                  orderInfoLength - i
                }]-1))-1)].GridSize-1/2*(paddingCatScale.Inner))) *(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0])   +   min(width,(paddingCatScale.Outer+data('Level${i}AxisDataHORIZONTAL')[round(datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[${
                  orderInfoLength - i
                }]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0]))>10,'${
                  palette.base[900]
                }' ,null)`
              }
            ]
          }
        },
        grid: {
          interactive: false,
          name: `catAxisGridLevel${i}`,
          update: {
            x: { value: -110 },
            x2: { signal: "width+110" },
            y: {
              signal: `(paddingCatScale.Outer+data('Level${i}AxisDataHORIZONTAL')[round(datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[${
                orderInfoLength - i
              }]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0]`
            }
          }
        },
        axis: {
          name: `GroupAxisXLevel${i}`,
          interactive: false,
          enter: {
            width: { signal: "-110" },
            height: { signal: "min(height,tableHeight)" },
            clip: { value: false }
          },
          update: {
            width: { signal: "-110" },
            height: { signal: "min(height,tableHeight)" },
            clip: { value: false },
            fill: {
              value: palette.base[i - 1 === 1 ? 50 : (i - 1) * 100]
            },
            stroke: {
              signal: "'transparent'"
              //signal: "if(GroupAxisHoverX.started,GroupAxisHoverX.stroke,'transparent')",
            },
            strokeWidth: { value: 3 },
            cornerRadius: { value: 5 }
          }
        }
      }
    });
    scaleLevels.push({
      name: `yScaleLevel${i}`,
      type: "band",
      domain: {
        data: `Level${i}AxisDataHORIZONTAL`,
        field: "ANASENLabelsHORIZONTAL"
      },
      range: { signal: "yRange" },
      paddingInner: { signal: "paddingCatScale.Inner" },
      paddingOuter: { signal: "paddingCatScale.Outer" }
    });
  }

console.log("otherAxesHorz", otherAxesHorz)

  const data = [
    {
      name: "labelsHORIZONTAL",
      values: [
        ["Male", "L"],
        ["Male", "XL"],
        ["Female", "S"],
        ["Female", "XS"],
        ["Female", "L"],
        ["Other", "XXS"],
        ["Other", "XXL"]
      ]
    },
    {
      name: "labels",
      values: [
        ["Air", "Fast"],
        ["Air", "Slow"],
        ["Mail", "Super Fast"],
        ["Mail", "Fast"],
        ["Mail", "Slow"],
        ["Mail", "Super Slow"]
      ]
    },
    {
      name: "chartStruct",
      values: [chartStruct]
    },
    {
      name: "table",
      values: [
        {
          l: "[607]",
          Gender: "Male",
          Size: "L",
          "Ship Mode": "Air",
          Speed: "Fast",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 23658.36,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "americanexpress"],
          ANASENRawIDX: [607]
        },
        {
          l: "[25]",
          Gender: "Male",
          Size: "L",
          "Ship Mode": "Air",
          Speed: "Slow",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 51246.21,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "bankcard"],
          ANASENRawIDX: [25]
        },
        {
          l: "[60]",
          Gender: "Male",
          Size: "L",
          "Ship Mode": "Mail",
          Speed: "Super Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 16609.08,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "china-unionpay"],
          ANASENRawIDX: [60]
        },
        {
          l: "[134]",
          Gender: "Male",
          Size: "L",
          "Ship Mode": "Mail",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 20224.01,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-carte-blanche"],
          ANASENRawIDX: [134]
        },
        {
          l: "[35]",
          Gender: "Male",
          Size: "L",
          "Ship Mode": "Mail",
          Speed: "Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 39484.03,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-enroute"],
          ANASENRawIDX: [35]
        },
        {
          l: "[275]",
          Gender: "Male",
          Size: "L",
          "Ship Mode": "Mail",
          Speed: "Super Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 27462.38,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-us-ca"],
          ANASENRawIDX: [275]
        },
        {
          l: "[8]",
          Gender: "Male",
          Size: "XL",
          "Ship Mode": "Air",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 188073.8,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "jcb"],
          ANASENRawIDX: [8]
        },
        {
          l: "[25]",
          Gender: "Male",
          Size: "XL",
          "Ship Mode": "Air",
          Speed: "Slow",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 25246.21,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "bankcard"],
          ANASENRawIDX: [25]
        },
        {
          l: "[60]",
          Gender: "Male",
          Size: "XL",
          "Ship Mode": "Mail",
          Speed: "Super Fast",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 26609.08,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "china-unionpay"],
          ANASENRawIDX: [60]
        },
        {
          l: "[134]",
          Gender: "Male",
          Size: "XL",
          "Ship Mode": "Mail",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 30224.01,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-carte-blanche"],
          ANASENRawIDX: [134]
        },
        {
          l: "[35]",
          Gender: "Male",
          Size: "XL",
          "Ship Mode": "Mail",
          Speed: "Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 19484.03,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-enroute"],
          ANASENRawIDX: [35]
        },
        {
          l: "[275]",
          Gender: "Male",
          Size: "XL",
          "Ship Mode": "Mail",
          Speed: "Super Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 57462.38,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-us-ca"],
          ANASENRawIDX: [275]
        },
        {
          l: "[8]",
          Gender: "Female",
          Size: "S",
          "Ship Mode": "Air",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 198073.8,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "jcb"],
          ANASENRawIDX: [8]
        },
        {
          l: "[25]",
          Gender: "Female",
          Size: "S",
          "Ship Mode": "Air",
          Speed: "Slow",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 51246.21,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "bankcard"],
          ANASENRawIDX: [25]
        },
        {
          l: "[60]",
          Gender: "Female",
          Size: "S",
          "Ship Mode": "Mail",
          Speed: "Super Fast",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 16609.08,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "china-unionpay"],
          ANASENRawIDX: [60]
        },
        {
          l: "[134]",
          Gender: "Female",
          Size: "S",
          "Ship Mode": "Mail",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 20224.01,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-carte-blanche"],
          ANASENRawIDX: [134]
        },
        {
          l: "[35]",
          Gender: "Female",
          Size: "S",
          "Ship Mode": "Mail",
          Speed: "Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 39484.03,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-enroute"],
          ANASENRawIDX: [35]
        },
        {
          l: "[275]",
          Gender: "Female",
          Size: "S",
          "Ship Mode": "Mail",
          Speed: "Super Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 27462.38,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-us-ca"],
          ANASENRawIDX: [275]
        },
        {
          l: "[8]",
          Gender: "Female",
          Size: "XS",
          "Ship Mode": "Air",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 288073.8,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "jcb"],
          ANASENRawIDX: [8]
        },
        {
          l: "[25]",
          Gender: "Female",
          Size: "XS",
          "Ship Mode": "Air",
          Speed: "Slow",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 51246.21,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "bankcard"],
          ANASENRawIDX: [25]
        },
        {
          l: "[60]",
          Gender: "Female",
          Size: "XS",
          "Ship Mode": "Mail",
          Speed: "Super Fast",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 16609.08,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "china-unionpay"],
          ANASENRawIDX: [60]
        },
        {
          l: "[134]",
          Gender: "Female",
          Size: "XS",
          "Ship Mode": "Mail",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 20224.01,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-carte-blanche"],
          ANASENRawIDX: [134]
        },
        {
          l: "[35]",
          Gender: "Female",
          Size: "XS",
          "Ship Mode": "Mail",
          Speed: "Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 39484.03,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-enroute"],
          ANASENRawIDX: [35]
        },
        {
          l: "[275]",
          Gender: "Female",
          Size: "XS",
          "Ship Mode": "Mail",
          Speed: "Super Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 27462.38,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-us-ca"],
          ANASENRawIDX: [275]
        },
        {
          l: "[8]",
          Gender: "Female",
          Size: "L",
          "Ship Mode": "Air",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 288073.8,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "jcb"],
          ANASENRawIDX: [8]
        },
        {
          l: "[25]",
          Gender: "Female",
          Size: "L",
          "Ship Mode": "Air",
          Speed: "Slow",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 51246.21,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "bankcard"],
          ANASENRawIDX: [25]
        },
        {
          l: "[60]",
          Gender: "Female",
          Size: "L",
          "Ship Mode": "Mail",
          Speed: "Super Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 16609.08,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "china-unionpay"],
          ANASENRawIDX: [60]
        },
        {
          l: "[134]",
          Gender: "Female",
          Size: "L",
          "Ship Mode": "Mail",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 20224.01,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-carte-blanche"],
          ANASENRawIDX: [134]
        },
        {
          l: "[275]",
          Gender: "Female",
          Size: "L",
          "Ship Mode": "Mail",
          Speed: "Super Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 27462.38,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-us-ca"],
          ANASENRawIDX: [275]
        },
        {
          l: "[8]",
          Gender: "Other",
          Size: "XXS",
          "Ship Mode": "Air",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 288073.8,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "jcb"],
          ANASENRawIDX: [8]
        },
        {
          l: "[25]",
          Gender: "Other",
          Size: "XXS",
          "Ship Mode": "Air",
          Speed: "Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 51246.21,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "bankcard"],
          ANASENRawIDX: [25]
        },
        {
          l: "[60]",
          Gender: "Other",
          Size: "XXS",
          "Ship Mode": "Mail",
          Speed: "Super Fast",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 16609.08,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "china-unionpay"],
          ANASENRawIDX: [60]
        },
        {
          l: "[35]",
          Gender: "Other",
          Size: "XXS",
          "Ship Mode": "Mail",
          Speed: "Slow",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 39484.03,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-enroute"],
          ANASENRawIDX: [35]
        },
        {
          l: "[275]",
          Gender: "Other",
          Size: "XXS",
          "Ship Mode": "Mail",
          Speed: "Super Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 27462.38,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-us-ca"],
          ANASENRawIDX: [275]
        },
        {
          l: "[8]",
          Gender: "Other",
          Size: "XXL",
          "Ship Mode": "Air",
          Speed: "Fast",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 288073.8,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "jcb"],
          ANASENRawIDX: [8]
        },
        {
          l: "[25]",
          Gender: "Other",
          Size: "XXL",
          "Ship Mode": "Air",
          Speed: "Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 51246.21,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "bankcard"],
          ANASENRawIDX: [25]
        },
        {
          l: "[60]",
          Gender: "Other",
          Size: "XXL",
          "Ship Mode": "Mail",
          Speed: "Super Fast",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 16609.08,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "china-unionpay"],
          ANASENRawIDX: [60]
        },
        {
          l: "[134]",
          Gender: "Other",
          Size: "XXL",
          "Ship Mode": "Mail",
          Speed: "Fast",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 20224.01,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-carte-blanche"],
          ANASENRawIDX: [134]
        },
        {
          l: "[35]",
          Gender: "Other",
          Size: "XXL",
          "Ship Mode": "Mail",
          Speed: "Slow",
          s: 0,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 39484.03,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-enroute"],
          ANASENRawIDX: [35]
        },
        {
          l: "[275]",
          Gender: "Other",
          Size: "XXL",
          "Ship Mode": "Mail",
          Speed: "Super Slow",
          s: 1,
          PivotedAnasenColumns: "sum(sales)",
          PivotedAnasenValues: 27462.38,
          PivotedAnasenValues_Selection: 0,
          ANASENLabels: ["2XL", "diners-club-us-ca"],
          ANASENRawIDX: [275]
        }
      ],
      transform: [
        {
          type: "formula",
          as: "ANASENLabels",
          expr: "[datum['Ship Mode'],datum['Speed']]"
        },
        {
          type: "formula",
          as: "ANASENLabelsHORIZONTAL",
          expr: "[datum['Gender'],datum['Size']]"
        },
        {
          type: "extent",
          field: "PivotedAnasenValues",
          signal: "PivotedAnasenValues_Ext"
        }
      ]
    },
    {
      name: "selectedbars",
      source: "table",
      transform: [
        { type: "filter", expr: "datum['s'] > 0" },
        {
          type: "extent",
          field: "PivotedAnasenValues_Selection",
          signal: "PivotedAnasenValues_Selection_Ext"
        }
      ]
    },
    {
      name: "MaxLengthLabels",
      source: "table",
      transform: [
        {
          type: "formula",
          as: "LengthLabel",
          expr: "length(peek(datum.ANASENLabels))*4"
        },
        {
          type: "aggregate",
          fields: ["LengthLabel"],
          ops: ["max"],
          as: ["MaxLength"]
        }
      ]
    },
    {
      name: "userData",
      values: [
        {
          columnsData: {
            Bycolumns: [
              {
                count: 7,
                range: [0, 1],
                rangeZoom: [0, 1],
                rangePin: [false, false],
                rangePinValues: [0, 1],
                zoomed: false
              },
              {
                count: 16,
                range: [0, 1],
                rangeZoom: [0, 1],
                rangePin: [false, false],
                rangePinValues: [0, 1],
                zoomed: false
              }
            ],
            Qcolumn: [
              {
                domain: [0, 1],
                domainZoom: [0, 1],
                domainPin: [false, false],
                domainPinValues: [0, 1],
                zoomed: false
              }
            ]
          }
        }
      ]
    }
    /*
    {
      name: "Level2AxisDataHORIZONTAL",
      source: "labelsHORIZONTAL",
      transform: [
        {
          type: "formula",
          as: "ANASENLabelsHORIZONTAL",
          expr: "[slice(datum[0])]"
        },
        {
          type: "aggregate",
          fields: ["ANASENLabelsHORIZONTAL"],
          ops: ["count"],
          groupby: ["ANASENLabelsHORIZONTAL"],
          as: ["GridSize"]
        },
        {
          type: "window",
          ops: ["sum"],
          fields: ["GridSize"],
          as: ["GridSize"]
        }
      ]
    }
      {
      name: "Level2AxisData",
      source: "labels",
      transform: [
        {
          type: "formula",
          as: "ANASENLabels",
          expr: "[slice(datum[0])]"
        },
        {
          type: "aggregate",
          fields: ["ANASENLabels"],
          ops: ["count"],
          groupby: ["ANASENLabels"],
          as: ["GridSize"]
        },
        {
          type: "window",
          ops: ["sum"],
          fields: ["GridSize"],
          as: ["GridSize"]
        }
      ]
    }*/
  ].concat(AxisDataLevels);

  const signals = [
    { name: "cellHeight", update: "20" },
    { name: "cellWidth", update: "80" },
    { name: "tableHeight", update: "NHOR*cellHeight" },
    { name: "tableWidth", update: "N*cellWidth" },
    {
      name: "catRangeNormalizedHORIZONTAL",
      update: "slice([0,tableHeight/height])",
      on: [
        {
          events: { signal: "extractQZoom" },
          update: "extractQZoom"
        }
      ]
    },
    {
      name: "yRange",
      update:
        "[catRangeNormalizedHORIZONTAL[0]*height,catRangeNormalizedHORIZONTAL[1]*height]"
    },
    {
      name: "isOnView",
      on: [
        {
          events: "view:mousemove",
          update:
            "  \n            xy()[0] > -50 && xy()[0] < width+50 && xy()[1] > 0 && xy()[1] < height+100\n          "
        }
      ]
    },
    {
      name: "test",
      update:
        "warn('userData',length(data('userData')) > 0 && data('userData'))"
    },
    // {
    //   name: "test2",
    //   update: "warn('extractQZoom', extractQZoom)"
    // },
    {
      name: "PivotedAnasenValues_Extent",
      update: "isFinite(PivotedAnasenValues_Ext[0]) && PivotedAnasenValues_Ext"
    },
    {
      name: "PivotedAnasenValues_Selection_Extent",
      update:
        "isFinite(PivotedAnasenValues_Selection_Ext[0]) && PivotedAnasenValues_Selection_Ext"
    },
    {
      name: "selectionIsOn",
      update: "{ selectionIsOn: length(data('selectedbars')) > 0 }"
    },
    {
      name: "domainObj",
      update:
        " isFinite(PivotedAnasenValues_Extent[0])\n      && { PivotedAnasenValues_Selection_Extent: isFinite(PivotedAnasenValues_Selection_Extent[0]) && PivotedAnasenValues_Selection_Extent,\n           PivotedAnasenValues_Extent: PivotedAnasenValues_Extent,\n           ydom: ydom\n                }"
    },
    {
      name: "unionDomain",
      update:
        "length(data('table')) > 0 \n      &&  isFinite(PivotedAnasenValues_Extent[0])\n      && [min(0, PivotedAnasenValues_Extent[0]), \n          max(0, PivotedAnasenValues_Extent[1])]"
    },
    {
      name: "QDomain",
      update:
        "length(data('table')) > 0    \n      &&  isFinite(PivotedAnasenValues_Extent[0]) \n      && (length(data('selectedbars')) > 0 && isFinite(PivotedAnasenValues_Selection_Extent[0]))\n      ?  [min(0, PivotedAnasenValues_Selection_Extent[0], PivotedAnasenValues_Extent[0]), \n          max(0, PivotedAnasenValues_Selection_Extent[1], PivotedAnasenValues_Extent[1])]\n      : [min(0, PivotedAnasenValues_Extent[0]), max(0, PivotedAnasenValues_Extent[1])]"
    },
    {
      name: "userData",
      update: "length(data('userData'))>0 && data('userData')[0]"
    },
    {
      name: "eventProxy",
      value: {
        event: null,
        mouseMoveInRange: { x: [0, 0], y: [0, 0] },
        mouseMoveInDomain: { x: [0, 0], y: [0, 0] },
        polygonInRange: []
      },
      on: [
        {
          events:
            "view:mousedown[event.button === 0 && !event.crtlKey && !event.metaKey]",
          update:
            "{\n        event: null,\n        domEvent: event,\n        item: event.item,\n        mouseMoveInRange: { x: [x(), x()], y: [y(), y()], distance: 0 },\n        polygonInRange: [ [ x(), y() ] ],\n        polygonInDomain: [ [ invert('xScale', x()), invert('yScale', y()) ] ]\n      }"
        },
        {
          events:
            "view:mousedown[event.button === 0 && !event.crtlKey && !event.metaKey]",
          update:
            "{\n        event: 'mousedown',\n        domEvent: eventProxy.event,\n        item: eventProxy.item,\n        mouseMoveInRange: eventProxy.mouseMoveInRange,\n        mouseMoveInDomain: {\n          x: [invert('xScale', eventProxy.mouseMoveInRange.x[0]), invert('xScale', eventProxy.mouseMoveInRange.x[1])],\n          y: [invert('yScale', eventProxy.mouseMoveInRange.y[0]), invert('yScale', eventProxy.mouseMoveInRange.y[1])]\n        },\n        polygonInRange: eventProxy.polygonInRange,\n        polygonInDomain: eventProxy.polygonInDomain\n      }"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.crtlKey && !event.metaKey], window:mouseup] > window:mousemove!",
          update:
            "{\n        event: eventProxy.event,\n        domEvent: event,\n        item: eventProxy.item,\n        mouseMoveInRange: {\n          x: eventProxy.mouseMoveInRange.x,\n          y: eventProxy.mouseMoveInRange.y,\n          distance: sqrt(pow(eventProxy.mouseMoveInRange.x[1] - eventProxy.mouseMoveInRange.x[0], 2) + pow(eventProxy.mouseMoveInRange.y[1] - eventProxy.mouseMoveInRange.y[0], 2))\n        },\n        mouseMoveInDomain: {\n          x: invert('xScale', eventProxy.mouseMoveInRange.x),\n          y: invert('yScale', eventProxy.mouseMoveInRange.y)\n        },\n        polygonInRange: eventProxy.polygonInRange,\n        polygonInDomain: eventProxy.polygonInDomain,\n      }"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.crtlKey && !event.metaKey], window:mouseup] > window:mousemove!",
          update:
            "{\n        event: eventProxy.event,\n        domEvent: event,\n        item: eventProxy.item,\n        mouseMoveInRange: {\n          x: eventProxy.mouseMoveInRange.x,\n          deltaX: eventProxy.mouseMoveInRange.x[1] - eventProxy.mouseMoveInRange.x[0],\n          y: eventProxy.mouseMoveInRange.y,\n          deltaY: eventProxy.mouseMoveInRange.y[1] - eventProxy.mouseMoveInRange.y[0],\n          distance: eventProxy.mouseMoveInRange.distance\n        },\n        mouseMoveInDomain: eventProxy.mouseMoveInDomain,\n        polygonInRange: eventProxy.polygonInRange,\n        polygonInDomain: eventProxy.polygonInDomain,\n      }"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.crtlKey && !event.metaKey], window:mouseup] > window:mousemove!",
          update:
            "{\n        event:\n          (abs(eventProxy.mouseMoveInRange.deltaX) >= 10 || abs(eventProxy.mouseMoveInRange.deltaY) >= 10)\n          ? (eventProxy.event === 'startdrawingshape' || eventProxy.event === 'drawingshape' ? 'drawingshape' : 'startdrawingshape')\n          : eventProxy.event,\n        domEvent: event,\n        item: eventProxy.item,\n        mouseMoveInRange: eventProxy.mouseMoveInRange,\n        mouseMoveInDomain: eventProxy.mouseMoveInDomain,\n        polygonInRange: eventProxy.polygonInRange,\n        polygonInDomain: eventProxy.polygonInDomain\n      }"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.crtlKey && !event.metaKey], window:mouseup] > window:mousemove!",
          update:
            "{\n        event: event.buttons === 0 ? ((eventProxy.event !== 'startdrawingshape' && eventProxy.event !== 'drawingshape') ? 'click': 'stopdrawingshape') : eventProxy.event,\n        domEvent: event,\n        item: eventProxy.item,\n        mouseMoveInRange: eventProxy.mouseMoveInRange,\n        mouseMoveInDomain: eventProxy.mouseMoveInDomain,\n        polygonInRange: eventProxy.polygonInRange,\n        polygonInDomain: eventProxy.polygonInDomain\n      }"
        },
        {
          events:
            "view:mouseup[event.button === 0 && !event.crtlKey && !event.metaKey]",
          update:
            "\n        {\n          event: (eventProxy.event !== 'startdrawingshape' && eventProxy.event !== 'drawingshape') ? 'click': 'stopdrawingshape',\n          domEvent: event,\n          item: eventProxy.item,\n          mouseMoveInRange: eventProxy.mouseMoveInRange,\n          mouseMoveInDomain: eventProxy.mouseMoveInDomain,\n          polygonInRange: eventProxy.polygonInRange,\n          polygonInDomain: eventProxy.polygonInDomain\n        }"
        },
        {
          events:
            "window:mouseup[event.button === 0 && !event.crtlKey && !event.metaKey]",
          update:
            "\n        {\n          event: (eventProxy.event !== 'click' && eventProxy.event !== 'stopdrawingshape' ||\n            eventProxy.domEvent.clientX !== event.clientX || eventProxy.domEvent.clientY !== event.clientY) ? 'clickOut': eventProxy.event,\n          domEvent: event,\n          item: eventProxy.item,\n          mouseMoveInRange: eventProxy.mouseMoveInRange,\n          mouseMoveInDomain: eventProxy.mouseMoveInDomain,\n          polygonInRange: eventProxy.polygonInRange,\n          polygonInDomain: eventProxy.polygonInDomain\n        }"
        }
      ]
    },
    {
      name: "zoomedQ",
      update:
        "length(data('userData')) > 0 && data('userData')[0].columnsData.Qcolumn[0].zoomed"
    },
    {
      name: "domainPinX",
      update:
        "length(data('userData')) > 0 && data('userData')[0].columnsData.Bycolumns[0].rangePin"
    },
    {
      name: "domainPinY",
      update:
        "length(data('userData')) > 0 && data('userData')[0].columnsData.Qcolumn[0].domainPin"
    },
    {
      name: "domainPinXValues",
      update:
        "length(data('userData')) > 0  && data('userData')[0].columnsData.Bycolumns[0].rangePinValues"
    },
    {
      name: "domainPinYValues",
      update:
        "length(data('userData')) > 0 && data('userData')[0].columnsData.Qcolumn[0].domainPinValues"
    },
    {
      name: "N",
      update:
        "(data('chartStruct')[0] && data('chartStruct')[0].OrderInfo.Count[data('chartStruct')[0].OrderInfo.Length - 1]) || 0"
    },
    {
      name: "NHOR",
      update:
        "(data('chartStruct')[0] && data('chartStruct')[0].OrderInfoHOR.Count[data('chartStruct')[0].OrderInfoHOR.Length - 1]) || 0"
    },
    {
      name: "lengthLabels",
      update:
        "data('MaxLengthLabels')[0] && data('MaxLengthLabels')[0].MaxLength || 0"
    },
    {
      name: "NoSelection",
      update: "if(length(data('selectedbars'))>0 ,false,true)"
    },
    {
      name: "resetSelectionOnClick",
      value: false,
      on: [
        {
          events: "@plottingArea:click",
          update:
            "{\n              selectionIsOn: selectionIsOn,\n              chartStructure: data('chartStruct')[0],\n              unionDomain: unionDomain,\n              value: eventProxy.event === 'click' && !eventProxy.domEvent.shiftKey && (!eventProxy.item || !isNumber(eventProxy.item.datum.numeric0))\n            }"
        }
      ]
    },
    {
      name: "OnClickDataMark",
      on: [
        {
          events: "@outlinesHover:click",
          force: true,
          update:
            "warn('clickDataMark', \n          eventProxy.event === 'click' \n          ? { chartStructure: data('chartStruct')[0], \n              value: datum,\n              shiftKey: event.shiftKey,\n              altKey: event.altKey }\n          : OnClickDataMark)"
        }
      ]
    },
    {
      name: "tooltip",
      value: {},
      on: [
        { events: "rect:mouseover", update: "datum" },
        { events: "rect:mouseout", update: "{}" }
      ]
    },
    {
      name: "tooltip2",
      value: {},
      on: [{ events: "@catAxisLabels:click", update: "datum" }]
    },
    {
      name: "down",
      value: null,
      on: [
        { events: "touchend", update: "null" },
        { events: "mousedown, touchstart", update: "xy()" }
      ]
    },
    {
      name: "xcur",
      value: null,
      on: [
        {
          events: "mousedown, touchstart, touchend",
          update: "slice(xRange)"
        }
      ]
    },
    {
      name: "ycur",
      value: "null",
      on: [
        {
          events: "mousedown, touchstart, touchend",
          update: "slice(yRange)"
        }
      ]
    },
    {
      name: "deltaX",
      value: "[0, 0]",
      on: [
        {
          events: [
            {
              source: "window",
              type: "mousemove",
              filter: ["event.ctrlKey || event.metaKey", "event.button === 0"],
              consume: true,
              between: [
                {
                  type: "mousedown",
                  filter: [
                    "event.ctrlKey || event.metaKey",
                    "event.button === 0"
                  ]
                },
                { source: "window", type: "mouseup" }
              ]
            },
            {
              type: "touchmove",
              consume: true,
              filter: "event.touches.length === 1"
            }
          ],
          update: "down ? [-down[0]+x(), -down[0]+x()]: [0,0]"
        },
        {
          events:
            "[@GroupAxisX:mousedown[event.item && event.item.cursor && event.item.cursor==='ew-resize'], window:mouseup] > view:mousemove!",
          update: "down ? [down[0]-x(), down[0]-x()] : [0,0]"
        },
        {
          events:
            "[@GroupAxisX:mousedown[event.item && event.item.cursor && event.item.cursor==='w-resize'], window:mouseup] > view:mousemove!",
          update: "down ? [down[0]-x(), 0] : [0,0]"
        },
        {
          events:
            "[@GroupAxisX:mousedown[event.item && event.item.cursor && event.item.cursor==='e-resize'], window:mouseup] > view:mousemove!",
          update: "down ? [0,down[0]-x()] : [0,0]"
        },
        {
          events:
            "[@GroupAxisY:mousedown[event.item && event.item.cursor && event.item.cursor==='ns-resize'], window:mouseup] > view:mousemove!",
          update: "[0,0]"
        },
        {
          events:
            "[@GroupAxisY:mousedown[event.item && event.item.cursor && event.item.cursor==='n-resize'], window:mouseup] > view:mousemove!",
          update: "[0,0]"
        },
        {
          events:
            "[@GroupAxisY:mousedown[event.item && event.item.cursor && event.item.cursor==='s-resize'], window:mouseup] > view:mousemove!",
          update: "[0,0]"
        }
      ]
    },
    {
      name: "deltaY",
      value: "[0, 0]",
      on: [
        {
          events: [
            {
              source: "window",
              type: "mousemove",
              filter: ["event.ctrlKey || event.metaKey", "event.button === 0"],
              consume: true,
              between: [
                { type: "mousedown" },
                { source: "window", type: "mouseup" }
              ]
            },
            {
              type: "touchmove",
              consume: true,
              filter: "event.touches.length === 1"
            }
          ],
          update: "down ? [-down[1]+y(), -down[1]+y()]: [0,0]"
        },
        {
          events:
            "[@GroupAxisX:mousedown[event.item && event.item.cursor && event.item.cursor==='ew-resize'], window:mouseup] > view:mousemove!",
          update: "[0,0]"
        },
        {
          events:
            "[@GroupAxisX:mousedown[event.item && event.item.cursor && event.item.cursor==='w-resize'], window:mouseup] > view:mousemove!",
          update: "[0,0]"
        },
        {
          events:
            "[@GroupAxisX:mousedown[event.item && event.item.cursor && event.item.cursor==='e-resize'], window:mouseup] > view:mousemove!",
          update: "[0,0]"
        },
        {
          events:
            "[@GroupAxisY:mousedown[event.item && event.item.cursor && event.item.cursor==='ns-resize'], window:mouseup] > view:mousemove!",
          update: "down ? [y()-down[1], y()-down[1]] : [0,0]"
        },
        {
          events:
            "[@GroupAxisY:mousedown[event.item && event.item.cursor && event.item.cursor==='n-resize'], window:mouseup] > view:mousemove!",
          update: "down ? [0,y()-down[1]] : [0,0]"
        },
        {
          events:
            "[@GroupAxisY:mousedown[event.item && event.item.cursor && event.item.cursor==='s-resize'], window:mouseup] > view:mousemove!",
          update: "down ? [y()-down[1],0] : [0,0]"
        }
      ]
    },
    {
      name: "anchor",
      value: [0, 0],
      on: [{ events: "wheel", update: "[x(), invert('yScale', y())]" }]
    },
    {
      name: "zoomX",
      value: "[1,1]",
      on: [
        {
          events: "view:wheel![!event.item ||!event.item.cursor]",
          force: true,
          update:
            "[pow(1.001, -event.deltaY * pow(16, event.deltaMode)),pow(1.001, -event.deltaY * pow(16, event.deltaMode))]"
        },
        {
          events:
            "@GroupAxisX:wheel![event.item && event.item.cursor && event.item.cursor==='ew-resize']",
          update:
            "[pow(1.001, event.deltaY * pow(16, event.deltaMode)),pow(1.001, event.deltaY * pow(16, event.deltaMode))]"
        },
        {
          events:
            "@GroupAxisX:wheel![event.item && event.item.cursor && event.item.cursor==='w-resize']",
          update: "[pow(1.001, event.deltaY * pow(16, event.deltaMode)),1]"
        },
        {
          events:
            "@GroupAxisX:wheel![event.item && event.item.cursor && event.item.cursor==='e-resize']",
          update: "[1,pow(1.001, event.deltaY * pow(16, event.deltaMode))]"
        },
        {
          events:
            "@GroupAxisY:wheel![event.item && event.item.cursor && event.item.cursor==='ns-resize']",
          update: "[1,1]"
        },
        {
          events:
            "@GroupAxisY:wheel![event.item && event.item.cursor && event.item.cursor==='s-resize']",
          update: "[1,1]"
        },
        {
          events:
            "@GroupAxisY:wheel![event.item && event.item.cursor && event.item.cursor==='n-resize']",
          update: "[1,1]"
        }
      ]
    },
    {
      name: "zoomY",
      value: "[1,1]",
      on: [
        {
          events: "view:wheel![!event.item ||!event.item.cursor]",
          force: true,
          update: "[1,1]"
        },
        {
          events:
            "@GroupAxisX:wheel![event.item && event.item.cursor && event.item.cursor==='ew-resize']",
          update: "[1,1]"
        },
        {
          events:
            "@GroupAxisX:wheel![event.item && event.item.cursor && event.item.cursor==='w-resize']",
          update: "[1,1]"
        },
        {
          events:
            "@GroupAxisX:wheel![event.item && event.item.cursor && event.item.cursor==='e-resize']",
          update: "[1,1]"
        },
        {
          events:
            "@GroupAxisY:wheel![event.item && event.item.cursor && event.item.cursor==='ns-resize']",
          update:
            "[pow(1.001, event.deltaY * pow(16, event.deltaMode)),pow(1.001, event.deltaY * pow(16, event.deltaMode))]"
        },
        {
          events:
            "@GroupAxisY:wheel![event.item && event.item.cursor && event.item.cursor==='s-resize']",
          update: "[pow(1.001, event.deltaY * pow(16, event.deltaMode)),1]"
        },
        {
          events:
            "@GroupAxisY:wheel![event.item && event.item.cursor && event.item.cursor==='n-resize']",
          update: "[1,pow(1.001, event.deltaY * pow(16, event.deltaMode))]"
        }
      ]
    },
    {
      name: "BarSize",
      update:
        "(1-paddingCatScale.Inner)*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)",
      on: [
        {
          events: { signal: "zoomX" },
          update:
            "(1-paddingCatScale.Inner)*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)"
        }
      ]
    },
    {
      name: "zoomObj",
      init:
        "{\n          catRangeNormalized : catRangeNormalized,\n          anchor : anchor,\n          BarSize: BarSize,\n          zoomX : zoomX,\n          zoomY : zoomY,\n          width : width,\n          ydom : ydom,\n        }",
      on: [
        {
          events: { signal: "zoomX" },
          update:
            "{\n              catRangeNormalized : catRangeNormalized,\n              anchor : anchor,\n              BarSize: BarSize,\n              zoomX : zoomX,\n              zoomY : zoomY,\n              width : width,\n              ydom : ydom,\n            }"
        },
        {
          events: { signal: "zoomY" },
          update:
            "{\n              catRangeNormalized : catRangeNormalized,\n              anchor : anchor,\n              BarSize: BarSize,\n              zoomX : zoomX,\n              zoomY : zoomY,\n              width : width,\n              ydom : ydom,\n            }"
        }
      ]
    },
    {
      name: "panObj",
      init: `{xcur: xcur,
          catRangeNormalized: catRangeNormalized,
          catRangeNormalizedHORIZONTAL: catRangeNormalizedHORIZONTAL,
          deltaX: deltaX,
          width: width,
          ycur: ycur,
          deltaY: deltaY,
          height: height,
          tableWidth: tableWidth,
          tableHeight: tableHeight
        }`,
      on: [
        {
          events: { signal: "deltaX" },
          update: `{xcur: xcur,
              catRangeNormalized: catRangeNormalized,
              catRangeNormalizedHORIZONTAL: catRangeNormalizedHORIZONTAL,
              deltaX: deltaX,
              width: width,
              ycur: ycur,
              deltaY: deltaY,
              height: height,
              tableWidth: tableWidth,
              tableHeight: tableHeight
            }`
        },
        {
          events: { signal: "deltaY" },
          update: `{xcur: xcur,
            catRangeNormalized: catRangeNormalized,
            catRangeNormalizedHORIZONTAL: catRangeNormalizedHORIZONTAL,
            deltaX: deltaX,
            width: width,
            ycur: ycur,
            deltaY: deltaY,
            height: height,
            tableWidth: tableWidth,
            tableHeight: tableHeight
          }`
        }
      ]
    },
    {
      name: "extractCatZoom",
      update:
        "length(data('userData')) > 0  && data('userData')[0].columnsData.Bycolumns[0].rangeZoom"
    },
    {
      name: "extractQZoom",
      update:
        "length(data('userData')) > 0 && data('userData')[0].columnsData.Qcolumn[0].domainZoom"
    },
    {
      name: "catRangeNormalized",
      update: "slice([0,tableWidth/width])",
      on: [
        {
          events: { signal: "extractCatZoom" },
          update:
            "domainPinX[0] && domainPinX[1] ? domainPinXValues : domainPinX[0] && !domainPinX[1] ? [domainPinXValues[0], extractCatZoom[1]] : !domainPinX[0] && domainPinX[1] ?  [extractCatZoom[0],domainPinXValues[1]] : extractCatZoom"
        }
      ]
    },
    {
      name: "xRange",
      update: "[catRangeNormalized[0]*width,catRangeNormalized[1]*width]"
    },
    {
      name: "ydomzoom",
      update:
        "length(data('userData')) > 0 && data('userData')[0].columnsData.Qcolumn[0].domain"
    },
    {
      name: "ydom",
      init: "ydomzoom",
      on: [
        {
          events: { signal: "extractQZoom" },
          update:
            "domainPinY[0] && domainPinY[1]\n            ? domainPinYValues\n            : (domainPinY[0] && !domainPinY[1]\n              ? [domainPinYValues[0], extractQZoom[1]]\n              : !domainPinY[0] && domainPinY[1]\n                ? [extractQZoom[0],domainPinYValues[1]]\n                : extractQZoom)"
        }
      ]
    },
    { name: "paddingCatScale", value: { Inner: 0, Outer: 0.05 } },
    {
      name: "CatLabelState",
      update: "if(catAxisProps.step>lengthLabels,1,3)",
      on: [
        {
          events: { signal: "catAxisProps" },
          update: "if(catAxisProps.step>lengthLabels,1,3)",
          force: true
        }
      ]
    },
    {
      name: "CatLabelParam",
      update:
        "if(CatLabelState===1,{'limit':catAxisProps.step-10,'angle' : 0,'baseline':'bottom','align':'center','height':55},if(CatLabelState===2,{'limit':50,'angle' : 0,'baseline':'middle','align':'center','height':55},{'limit':70,'angle' : -90,'baseline':'middle','align':'right','height':130}))",
      on: [
        {
          events: { signal: "CatLabelState" },
          update:
            "if(CatLabelState===1,{'limit':catAxisProps.step-10,'angle' : 0,'baseline':'bottom','align':'center','height':55},if(CatLabelState===2,{'limit':50,'angle' : 0,'baseline':'middle','align':'center','height':55},{'limit':70,'angle' : -90,'baseline':'middle','align':'right','height':130}))"
        }
      ]
    },
    {
      name: "catAxisProps",
      update:
        "{'step' : (1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)}",
      on: [
        {
          events: { signal: "xRange" },
          update:
            "{'step' : (1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)}",
          force: true
        }
      ]
    },
    {
      name: "mousePositionX",
      value: "default",
      on: [
        {
          events:
            "[@GroupAxisX:mouseover, @GroupAxisX:mouseout] > @GroupAxisX:mousemove!",
          update:
            "{'positionOnAxis' : if(x()<width*2/3,if(x()<width/3,'firstThird','middleThird'),'lastThird')}"
        },
        { events: "@GroupAxisX:mouseout", update: "'default'" }
      ]
    },
    {
      name: "GroupAxisHoverX",
      value:
        "{'started': true,'fill' : 'transparent', 'stroke' : 'transparent','cursor' : 'default'}",
      on: [
        {
          events: [
            {
              markname: "GroupAxisX",
              type: "mousemove",
              consume: true,
              between: [
                { type: "mouseover", markname: "GroupAxisX" },
                { type: "mouseout", markname: "GroupAxisX" }
              ]
            },
            {
              markname: "labelsBoxes",
              type: "mouseover",
              consume: true
            }
          ],
          update:
            "{'started': true,'fill' : 'blue', 'stroke' : 'black','cursor' : if(mousePositionX.positionOnAxis==='firstThird','w-resize',if(mousePositionX.positionOnAxis==='middleThird','ew-resize','e-resize'))}"
        },
        {
          events: [
            { markname: "GroupAxisX", type: "mouseout", consume: true },
            { markname: "labelsBoxes", type: "mouseout", consume: true }
          ],
          update:
            "{'started': true,'fill' : 'transparent', 'stroke' : 'transparent','cursor' : 'default'}"
        }
      ]
    },
    {
      name: "mousePositionY",
      value: "default",
      on: [
        {
          events:
            "[@GroupAxisY:mouseover, @GroupAxisY:mouseout] > @GroupAxisY:mousemove!",
          update:
            "{'positionOnAxis' : if(y()<height*2/3,if(y()<height/3,'firstThird','middleThird'),'lastThird')}"
        },
        { events: "@GroupAxisY:mouseout", update: "'default'" }
      ]
    },
    {
      name: "GroupAxisHoverY",
      value:
        "{'started': true,'fill' : 'transparent', 'stroke' : 'transparent','cursor' : 'default'}",
      on: [
        {
          events:
            "[@GroupAxisY:mouseover, @GroupAxisY:mouseout] > @GroupAxisY:mousemove!",
          update:
            "{'started': true,'fill' : 'blue', 'stroke' : 'black','cursor' : if(mousePositionY.positionOnAxis==='firstThird','n-resize',if(mousePositionY.positionOnAxis==='middleThird','ns-resize','s-resize'))}"
        },
        {
          events: "@GroupAxisY:mouseout",
          update:
            "{'started': true,'fill' : 'transparent', 'stroke' : 'transparent','cursor' : 'default'}"
        }
      ]
    },
    {
      name: "rectBrush",
      value: {
        state: "init",
        segmentInRange: { x: [0, 0], y: [0, 0] }
      },
      description:
        "The rectangle to select brush uses here the event proxy to detect that the user is beginning to draw a shape with the mouse",
      on: [
        {
          events: "window:mouseup[event.button === 0 && !event.ctrlKey]",
          description:
            "For unknown raison, we must put this events declaration at the beginning",
          update:
            "\n        eventProxy.event === 'stopdrawingshape' && rectBrush.state !== 'init' && isOnView\n          ? {\n              state: 'stop',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : rectBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description:
            "The user has reach the amount of pixels to claim that he is drawing a shape, we start the boxSelection",
          update:
            "\n        eventProxy.event === 'startdrawingshape' && isOnView\n          ? {\n              state: 'start',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : rectBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description: "The user keep drawing its shape, we store new coords",
          update:
            "eventProxy.event === 'drawingshape' && isOnView\n          ?\n            {\n              state: 'resizing',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : rectBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description: "The user keep drawing its shape, we store new coords",
          update:
            "\n        (eventProxy.event === 'drawingshape' && \n          !(abs(eventProxy.mouseMoveInRange.deltaX) > 8 && abs(eventProxy.mouseMoveInRange.deltaY) > 8)) \n          ?\n            {\n              state: 'init',\n              segmentInRange: { x: [0, 0], y: [0, 0] },\n              domEvent: eventProxy.domEvent\n            }\n          : rectBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description:
            "For unknown raison, we must put this events declaration at the beginning",
          update:
            "\n        eventProxy.event === 'stopdrawingshape' && rectBrush.state !== 'init' && rectBrush.state !== 'stop'\n          ? {\n              state: 'stop',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : rectBrush"
        }
      ]
    },
    {
      name: "sliceXBrush",
      value: {
        state: "init",
        segmentInRange: { x: [0, 0], y: [0, 0] }
      },
      description:
        "The rectangle to select brush uses here the event proxy to detect that the user is beginning to draw a shape with the mouse",
      on: [
        {
          events: "window:mouseup[event.button === 0 && !event.ctrlKey]",
          description:
            "For unknown raison, we must put this events declaration at the beginning",
          update:
            "\n        eventProxy.event === 'stopdrawingshape' && sliceXBrush.state !== 'init' && isOnView\n          ? {\n              state: 'stop',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceXBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description:
            "The user has reach the amount of pixels to claim that he is drawing a shape, we start the boxSelection",
          update:
            "\n        eventProxy.event === 'startdrawingshape' && isOnView\n          ? {\n              state: 'start',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceXBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description: "The user keep drawing its shape, we store new coords",
          update:
            "eventProxy.event === 'drawingshape' && isOnView\n          ?\n            {\n              state: 'resizing',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceXBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description: "The user keep drawing its shape, we store new coords",
          update:
            "\n        (eventProxy.event === 'drawingshape' && \n          !(abs(eventProxy.mouseMoveInRange.deltaX) > 8 && abs(eventProxy.mouseMoveInRange.deltaY) <= 8)) \n          ?\n            {\n              state: 'init',\n              segmentInRange: { x: [0, 0], y: [0, 0] },\n              domEvent: eventProxy.domEvent\n            }\n          : sliceXBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description:
            "For unknown raison, we must put this events declaration at the beginning",
          update:
            "\n        eventProxy.event === 'stopdrawingshape' && sliceXBrush.state !== 'init' && sliceXBrush.state !== 'stop'\n          ? {\n              state: 'stop',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceXBrush"
        }
      ]
    },
    {
      name: "sliceYBrush",
      value: {
        state: "init",
        segmentInRange: { x: [0, 0], y: [0, 0] }
      },
      description:
        "The rectangle to select brush uses here the event proxy to detect that the user is beginning to draw a shape with the mouse",
      on: [
        {
          events: "window:mouseup[event.button === 0 && !event.ctrlKey]",
          description:
            "For unknown raison, we must put this events declaration at the beginning",
          update:
            "\n        eventProxy.event === 'stopdrawingshape' && sliceYBrush.state !== 'init' && isOnView\n          ? {\n              state: 'stop',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceYBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description:
            "The user has reach the amount of pixels to claim that he is drawing a shape, we start the boxSelection",
          update:
            "\n        eventProxy.event === 'startdrawingshape' && isOnView\n          ? {\n              state: 'start',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceYBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description: "The user keep drawing its shape, we store new coords",
          update:
            "eventProxy.event === 'drawingshape' && isOnView\n          ?\n            {\n              state: 'resizing',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceYBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description: "The user keep drawing its shape, we store new coords",
          update:
            "\n        (eventProxy.event === 'drawingshape' && \n          !(abs(eventProxy.mouseMoveInRange.deltaX) <= 8 && abs(eventProxy.mouseMoveInRange.deltaY) > 8)) \n          ?\n            {\n              state: 'init',\n              segmentInRange: { x: [0, 0], y: [0, 0] },\n              domEvent: eventProxy.domEvent\n            }\n          : sliceYBrush"
        },
        {
          events:
            "[view:mousedown[event.button === 0 && !event.ctrlKey], window:mouseup] > window:mousemove!",
          description:
            "For unknown raison, we must put this events declaration at the beginning",
          update:
            "\n        eventProxy.event === 'stopdrawingshape' && sliceYBrush.state !== 'init' && sliceYBrush.state !== 'stop'\n          ? {\n              state: 'stop',\n              segmentInRange: eventProxy.mouseMoveInRange,\n              segmentInDomain: eventProxy.mouseMoveInDomain,\n              domEvent: eventProxy.domEvent\n            }\n          : sliceYBrush"
        }
      ]
    },
    {
      name: "rectBrushForSelection",
      value: { state: "init", brush: {}, chartStructure: {} },
      on: [
        {
          events: [{ signal: "rectBrush" }],
          update:
            "\n          rectBrush.state === 'stop'\n            ? {\n                brush: rectBrush,\n                chartStructure: data('chartStruct')[0]\n              }\n            : rectBrushForSelection"
        }
      ]
    },
    {
      name: "sliceXBrushForSelection",
      value: { state: "init", brush: {}, chartStructure: {} },
      on: [
        {
          events: [{ signal: "sliceXBrush" }],
          update:
            "\n          sliceXBrush.state === 'stop'\n            ? {\n                brush: sliceXBrush,\n                chartStructure: data('chartStruct')[0]\n              }\n            : sliceXBrushForSelection"
        }
      ]
    },
    {
      name: "sliceYBrushForSelection",
      value: { state: "init", brush: {}, chartStructure: {} },
      on: [
        {
          events: [{ signal: "sliceYBrush" }],
          update:
            "\n          sliceYBrush.state === 'stop'\n            ? {\n                brush: sliceYBrush,\n                chartStructure: data('chartStruct')[0]\n              }\n            : sliceYBrushForSelection"
        }
      ]
    }
  ];
  const marks = [
    {
      type: "rect",
      name: "plottingArea",
      encode: {
        enter: {
          x: { value: 0 },
          width: { signal: "width" },
          y: { value: 0 },
          height: { signal: "height" },
          fill: { value: "transparent" }
        },
        update: {
          x: { value: 0 },
          width: { signal: "width" },
          y: { value: 0 },
          height: { signal: "height" },
          fill: { value: "transparent" }
        }
      }
    },
    {
      name: "databars",
      type: "rect",
      from: { data: "table" },
      clip: true,
      encode: {
        update: {
          x: { scale: "xScale", field: "ANASENLabels" },
          width: { scale: "xScale", band: 1 },
          y: { scale: "yScale", field: "ANASENLabelsHORIZONTAL" },
          height: { scale: "yScale", band: 1 },
          fill: [
            {
              test: "NoSelection",
              scale: "colorFull",
              field: "PivotedAnasenValues"
            },
            { scale: "colorLight", field: "PivotedAnasenValues" }
          ]
        }
      }
    },
    {
      type: "group",
      name: "UpperCatAxesGroup",
      encode: {
        zindex: { value: 5 },
        update: {
          x: { value: 0 },
          width: { signal: "min(width,tableWidth)" },
          y: { signal: "-30 * 2-CatLabelParam.height" },
          height: {
            signal: "min(height,tableHeight) + 30 * 2+CatLabelParam.height"
          },
          stroke: { signal: "'transparent'" }
        }
      },
      marks: [
        {
          type: "group",
          clip: true,
          encode: {
            zindex: { value: 5 },
            update: {
              x: { value: 0 },
              width: { signal: "min(width,tableWidth)" },
              y: { signal: "0" },
              height: {
                signal: "min(height,tableHeight) + 30 * 2+CatLabelParam.height"
              },
              stroke: { signal: "'transparent'" }
            }
          },
          axes: [
            {
              scale: "xScale",
              orient: "top",
              offset: -30,
              title: "size / creditCard",
              titleFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
              titleFontSize: 13,
              titleFontWeight: 700,
              titleLineHeight: 16,
              titleColor: "#374B5F",
              titleAlign: "center",
              titleBaseline: "middle",
              zindex: 0,
              domain: false,
              ticks: false,
              grid: false,
              labels: false,
              encode: {
                title: {
                  update: {
                    x: { signal: "min(width,tableWidth)/2" },
                    y: { signal: "-15" }
                  }
                },
                axis: {
                  name: "CatTitle",
                  interactive: true,
                  enter: {
                    width: { signal: "min(width,tableWidth)" },
                    height: { signal: "-30" },
                    clip: { value: false }
                  },
                  update: {
                    width: { signal: "min(width,tableWidth)" },
                    height: { signal: "-30" },
                    clip: { value: true },
                    fill: { signal: "'transparent'" },
                    stroke: { signal: "'transparent'" },
                    strokeWidth: { value: 3 },
                    cornerRadius: { value: 5 }
                  }
                }
              }
            }
            // {
            //   scale: "xScaleLevel2",
            //   orient: "top",
            //   offset: -60,
            //   zindex: 0,
            //   domain: false,
            //   ticks: false,
            //   grid: true,
            //   gridColor: "#DFE6ED",
            //   labelPadding: 5,
            //   labelFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
            //   labelFontSize: 11,
            //   labelFontWeight: 400,
            //   labelLineHeight: "13px",
            //   labelColor: "#374B5F",
            //   labelOverlap: "greedy",
            //   labelSeparation: 0,
            //   labelFlush: true,
            //   labelBound: 5,
            //   encode: {
            //     labels: {
            //       interactive: false,
            //       name: "catAxisLabelsLevel2",
            //       update: {
            //         text: { signal: "peek(datum.value)" },
            //         x: {
            //           signal:
            //             "\n                  (max(0,\n                    (if(datum.index===0,\n                      0,\n                      paddingCatScale.Outer +\n                      data('Level2AxisData')[round( (datum.index * (data('chartStruct')[0].OrderInfo.Count[0] - 1)) - 1)].GridSize - 1/2 * (paddingCatScale.Inner))) *\n                    (1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]) +\n                    min(width,\n                      (paddingCatScale.Outer+data('Level2AxisData')[round(datum.index*(data('chartStruct')[0].OrderInfo.Count[0]-1))].GridSize -\n                      1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]))/2"
            //         },
            //         y: { signal: "-15" },
            //         angle: { signal: "0" },
            //         baseline: { signal: "'middle'" },
            //         align: { signal: "'center'" },
            //         limit: {
            //           signal:
            //             "max(0.000001, (- max(0,\n                    if (datum.index===0,\n                      0,\n                      paddingCatScale.Outer +\n                      data('Level2AxisData')[round((datum.index * (data('chartStruct')[0].OrderInfo.Count[0]-1)) - 1)].GridSize\n                      - 1 / 2 * paddingCatScale.Inner) *\n                      (1 / ( 2 * paddingCatScale.Outer + N * (1 - paddingCatScale.Inner) + ((N-1) * paddingCatScale.Inner)) ) *\n                      span(xRange) + xRange[0]) +\n                      min(width,\n                        (paddingCatScale.Outer +\n                        data('Level2AxisData')[round(datum.index * (data('chartStruct')[0].OrderInfo.Count[0]-1))].GridSize -\n                        1/2 * (paddingCatScale.Inner)) * (1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner))) * span(xRange)+xRange[0])))"
            //         },
            //         opacity: [{ signal: "1" }],
            //         fill: [
            //           {
            //             signal:
            //               "if((- max(0,(if(datum.index===0,0,paddingCatScale.Outer+data('Level2AxisData')[round((datum.index*(data('chartStruct')[0].OrderInfo.Count[0]-1))-1)].GridSize-1/2*(paddingCatScale.Inner))) *(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0])   +   min(width,(paddingCatScale.Outer+data('Level2AxisData')[round(datum.index*(data('chartStruct')[0].OrderInfo.Count[0]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]))>10, '#374B5F' ,null)"
            //           }
            //         ]
            //       }
            //     },
            //     grid: {
            //       interactive: false,
            //       name: "catAxisGridLevel2",
            //       update: {
            //         y: { value: -30 },
            //         y2: { signal: "height+30" },
            //         x: {
            //           signal:
            //             "(paddingCatScale.Outer+data('Level2AxisData')[round(datum.index*(data('chartStruct')[0].OrderInfo.Count[0]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]"
            //         }
            //       }
            //     },
            //     axis: {
            //       name: "GroupAxisXLevel2",
            //       interactive: false,
            //       enter: {
            //         width: { signal: "min(width,tableWidth)" },
            //         height: { signal: "-30" },
            //         clip: { value: false }
            //       },
            //       update: {
            //         width: { signal: "min(width,tableWidth)" },
            //         height: { signal: "-30" },
            //         clip: { value: false },
            //         fill: { value: "#F9FAFD" },
            //         stroke: { signal: "'transparent'" },
            //         strokeWidth: { value: 3 },
            //         cornerRadius: { value: 5 }
            //       }
            //     }
            //   }
            // }
          ].concat(otherAxes)
        }
      ]
    },
    {
      type: "group",
      name: "UpperCatAxesGroupHORIZONTAL",
      encode: {
        zindex: { value: 5 },
        update: {
          y: { value: 0 },
          width: { signal: "min(tableWidth,width)+110 * 2" },
          x: { signal: "-110 * 2" },
          height: { signal: "min(tableHeight,height)" },
          stroke: { signal: "'transparent'" }
        }
      },
      marks: [
        {
          type: "group",
          clip: true,
          encode: {
            zindex: { value: 15 },
            update: {
              x: { value: 0 },
              width: { signal: "min(tableWidth,width)+110 * 2" },
              y: { signal: "0" },
              height: { signal: "min(tableHeight,height)" },
              stroke: { signal: "'transparent'" }
            }
          },
          axes: [
            {
              scale: "yScaleLevel2",
              orient: "left",
              offset: -110,
              zindex: -5,
              domain: false,
              ticks: false,
              grid: false,
              gridColor: "#DFE6ED",
              labels: false,
              title: "Gender",
              titleAnchor: "start",
              titleAngle: 0,
              titlePadding: 0,
              titleAlign: "center",
              titleBaseline: "bottom",
              titleFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
              titleFontSize: 13,
              titleFontWeight: 700,
              titleLineHeight: 16,
              titleX: -55,
              titleY: 0,
              encode: {
                domain: {
                  update: { y: { value: 0 }, y2: { signal: "height" } }
                },
                axis: {
                  name: "GroupAxisXLevel2",
                  interactive: false,
                  enter: {
                    width: { signal: "-110" },
                    height: { signal: "min(height,tableHeight)" },
                    clip: { value: false }
                  },
                  update: {
                    width: { signal: "-110" },
                    height: { signal: "min(height,tableHeight)" },
                    clip: { value: false },
                    fill: { value: "#F9FAFD" },
                    stroke: { signal: "'transparent'" },
                    strokeWidth: { value: 3 },
                    cornerRadius: { value: 5 }
                  }
                }
              }
            }
          ]//.concat(otherAxesHorz)
        },
        {
          type: "group",
          clip: false,
          encode: {
            zindex: { value: 15 },
            update: {
              x: { value: 0 },
              width: { signal: "min(tableWidth,width)+110 * 2" },
              y: { signal: "0" },
              height: { signal: "min(tableHeight,height)" },
              stroke: { signal: "'transparent'" }
            }
          },
          axes: [
            {
              scale: "yScaleLevel2",
              orient: "left",
              offset: -220,
              zindex: -5,
              domain: false,
              ticks: false,
              grid: false,
              gridColor: "#DFE6ED",
              labels: false,
              title: "Size",
              titleAnchor: "start",
              titleAngle: 0,
              titlePadding: 0,
              titleAlign: "center",
              titleBaseline: "bottom",
              titleFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
              titleFontSize: 13,
              titleFontWeight: 700,
              titleLineHeight: 16,
              titleX: -55,
              titleY: 0,
              encode: {
                domain: {
                  update: { y: { value: 0 }, y2: { signal: "height" } }
                },
                axis: {
                  name: "GroupAxisXLevel2",
                  interactive: false,
                  enter: {
                    width: { signal: "-110" },
                    height: { signal: "min(height,tableHeight)" },
                    clip: { value: false }
                  },
                  update: {
                    width: { signal: "-110" },
                    height: { signal: "min(height,tableHeight)" },
                    clip: { value: false },
                    fill: { value: "transparent" },
                    stroke: { signal: "'transparent'" },
                    strokeWidth: { value: 3 },
                    cornerRadius: { value: 5 }
                  }
                }
              }
            }
          ]
        },
        {
          type: "group",
          clip: true,
          encode: {
            zindex: { value: 5 },
            update: {
              x: { value: 0 },
              width: { signal: "min(tableWidth,width)+110 * 2" },
              y: { signal: "0" },
              height: { signal: "min(tableHeight,height)" },
              stroke: { signal: "'transparent'" }
            }
          },
          axes: [
            // {
            //   scale: "yScaleLevel2",
            //   orient: "left",
            //   offset: -110,
            //   zindex: 0,
            //   domain: false,
            //   ticks: false,
            //   grid: true,
            //   gridColor: "#DFE6ED",
            //   labelPadding: 5,
            //   labelFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
            //   labelFontSize: 11,
            //   labelFontWeight: 400,
            //   labelLineHeight: "13px",
            //   labelColor: "#374B5F",
            //   labelOverlap: "greedy",
            //   labelSeparation: 0,
            //   labelFlush: true,
            //   labelBound: 5,
            //   title: "Gender",
            //   titleAnchor: "start",
            //   titleAngle: 0,
            //   titlePadding: 0,
            //   titleAlign: "center",
            //   titleBaseline: "bottom",
            //   titleFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
            //   titleFontSize: 13,
            //   titleFontWeight: 700,
            //   titleLineHeight: 16,
            //   titleX: -55,
            //   titleY: 0,
            //   encode: {
            //     domain: {
            //       update: { y: { value: 0 }, y2: { signal: "height" } }
            //     },
            //     labels: {
            //       interactive: true,
            //       name: "catAxisLabelsLevel2",
            //       update: {
            //         text: { signal: "peek(datum.value)" },
            //         y: {
            //           signal:
            //             "(max(0,(if(datum.index===0,0,paddingCatScale.Outer+data('Level2AxisDataHORIZONTAL')[round((datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[0]-1))-1)].GridSize-1/2*(paddingCatScale.Inner))) *(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0])   +   min(height,(paddingCatScale.Outer+data('Level2AxisDataHORIZONTAL')[round(datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[0]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0]))/2"
            //         },
            //         angle: { signal: "0" },
            //         baseline: { signal: "'middle'" },
            //         align: { signal: "'right'" },
            //         limit: { signal: "100" },
            //         opacity: [{ signal: "1" }],
            //         fill: [
            //           {
            //             signal:
            //               "if((- max(0,(if(datum.index===0,0,paddingCatScale.Outer+data('Level2AxisDataHORIZONTAL')[round((datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[0]-1))-1)].GridSize-1/2*(paddingCatScale.Inner))) *(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0])   +   min(height,(paddingCatScale.Outer+data('Level2AxisDataHORIZONTAL')[round(datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[0]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0]))>10,'#374B5F' ,null)"
            //           }
            //         ]
            //       }
            //     },
            //     grid: {
            //       interactive: false,
            //       name: "catAxisGridLevel2",
            //       update: {
            //         x: { value: -110 },
            //         x2: { signal: "width+110" },
            //         y: {
            //           signal:
            //             "(paddingCatScale.Outer+data('Level2AxisDataHORIZONTAL')[round(datum.index*(data('chartStruct')[0].OrderInfoHOR.Count[0]-1))].GridSize-1/2*(paddingCatScale.Inner))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0]"
            //         }
            //       }
            //     },
            //     axis: {
            //       name: "GroupAxisXLevel2",
            //       interactive: false,
            //       enter: {
            //         width: { signal: "-110" },
            //         height: { signal: "min(height,tableHeight)" },
            //         clip: { value: false }
            //       },
            //       update: {
            //         width: { signal: "-110" },
            //         height: { signal: "min(height,tableHeight)" },
            //         clip: { value: false },
            //         fill: { value: "#F9FAFD" },
            //         stroke: { signal: "'transparent'" },
            //         strokeWidth: { value: 3 },
            //         cornerRadius: { value: 5 }
            //       }
            //     }
            //   }
            // }
          ].concat(otherAxesHorz)
        }
      ]
    },
    {
      name: "selectedOutlineHover",
      type: "rect",
      from: { data: "selectedbars" },
      clip: true,
      encode: {
        enter: { stroke: { value: "black" }, strokeOpacity: { value: 1 } },
        update: {
          x: { scale: "xScale", field: "ANASENLabels" },
          width: { scale: "xScale", band: 1 },
          y: { scale: "yScale", field: "ANASENLabelsHORIZONTAL" },
          height: { scale: "yScale", band: 1 },
          fill: { value: "transparent" },
          strokeWidth: [{ test: "datum['s']===1", value: 3 }, { value: 0 }]
        }
      }
    },
    {
      name: "datatext",
      type: "text",
      from: { data: "databars" },
      clip: true,
      encode: {
        update: {
          text: { signal: "datum.datum.PivotedAnasenValues" },
          x: { signal: "datum.x" },
          y: { signal: "datum.y" },
          dx: { scale: "xScale", band: 0.5 },
          dy: { scale: "yScale", band: 0.5 },
          align: { value: "center" },
          baseline: { value: "middle" },
          fill: [
            {
              test: "NoSelection",
              signal:
                "if(contrast('white', datum.fill) > contrast('black', datum.fill),'white','black')"
            },
            { value: "grey" }
          ]
        }
      }
    },
    {
      name: "databarselected",
      type: "rect",
      from: { data: "selectedbars" },
      clip: true,
      interactive: {
        signal:
          "eventProxy.event !== 'drawingshape' && eventProxy.event !== 'startdrawingshape'"
      },
      encode: {
        update: {
          x: { scale: "xScale", field: "ANASENLabels" },
          width: { scale: "xScale", band: 1 },
          y: { scale: "yScale", field: "ANASENLabelsHORIZONTAL" },
          height: { scale: "yScale", band: 1 },
          fill: { scale: "colorFull", field: "PivotedAnasenValues" },
          tooltip: { signal: "datum" }
        },
        hover: {}
      }
    },
    {
      name: "datatextselected",
      type: "text",
      from: { data: "databarselected" },
      clip: true,
      encode: {
        update: {
          text: { signal: "datum.datum.PivotedAnasenValues_Selection" },
          x: { signal: "datum.x" },
          y: { signal: "datum.y" },
          dx: { scale: "xScale", band: 0.5 },
          dy: { scale: "yScale", band: 0.5 },
          align: { value: "center" },
          baseline: { value: "middle" },
          fill: [
            {
              test:
                "contrast('white', datum.fill) > contrast('black', datum.fill)",
              value: "white"
            },
            { value: "black" }
          ]
        }
      }
    },
    {
      name: "outlinesHover",
      type: "rect",
      from: { data: "table" },
      clip: true,
      interactive: {
        signal:
          "eventProxy.event !== 'drawingshape' && eventProxy.event !== 'startdrawingshape'"
      },
      encode: {
        enter: { stroke: { value: "black" }, strokeOpacity: { value: 1 } },
        update: {
          x: { scale: "xScale", field: "ANASENLabels" },
          width: { scale: "xScale", band: 1 },
          y: { scale: "yScale", field: "ANASENLabelsHORIZONTAL" },
          height: { scale: "yScale", band: 1 },
          fill: { value: "transparent" },
          strokeWidth: { value: 0 },
          tooltip: { signal: "datum" }
        },
        exit: { strokeWidth: { value: 0 } },
        hover: { strokeWidth: { value: 1 }, zindex: { value: 1 } }
      }
    },
    {
      type: "rect",
      name: "rectBrush",
      encode: {
        enter: {},
        update: {
          stroke: [
            { test: "rectBrush.state === 'resizing'", value: "#ABB9C8" },
            { value: null }
          ],
          strokeWidth: [
            {
              test:
                "(rectBrush.state === 'resizing' || rectBrush.state === 'stop')",
              value: 2
            },
            { value: 0 }
          ],
          fill: [
            { test: "rectBrush.state === 'resizing'", value: "#8b9bac" },
            { value: null }
          ],
          fillOpacity: { signal: "rectBrush.state === 'resizing' ? 0.2 : 0" },
          zindex: { signal: "rectBrush.state === 'resizing' ? 10 : -100" },
          x: {
            signal:
              "rectBrush.state === 'resizing' && rectBrush.segmentInRange.x[0]"
          },
          y: {
            signal:
              "rectBrush.state === 'resizing' && rectBrush.segmentInRange.y[0]"
          },
          x2: {
            signal:
              "rectBrush.state === 'resizing' && rectBrush.segmentInRange.x[1]"
          },
          y2: {
            signal:
              "rectBrush.state === 'resizing' && rectBrush.segmentInRange.y[1]"
          }
        }
      }
    },
    {
      type: "rect",
      name: "sliceXBrush",
      encode: {
        enter: { y: { value: 0 } },
        update: {
          stroke: [
            { test: "sliceXBrush.state === 'resizing'", value: "#ABB9C8" },
            { value: null }
          ],
          strokeWidth: [
            {
              test:
                "sliceXBrush.state === 'resizing' || sliceXBrush.state === 'stop'",
              value: 2
            },
            { value: 0 }
          ],
          fill: [
            { test: "sliceXBrush.state === 'resizing'", value: "#8b9bac" },
            { value: null }
          ],
          height: { signal: "height" },
          fillOpacity: {
            signal: "(sliceXBrush.state === 'resizing') ? 0.2 : 0"
          },
          zindex: { signal: "sliceXBrush.state === 'resizing' ? 10 : -100" },
          x: {
            signal:
              "sliceXBrush.state === 'resizing' && sliceXBrush.segmentInRange.x[0]"
          },
          x2: {
            signal:
              "sliceXBrush.state === 'resizing' && sliceXBrush.segmentInRange.x[1]"
          }
        }
      }
    },
    {
      type: "rect",
      name: "sliceYBrush",
      encode: {
        enter: { x: { value: 0 } },
        update: {
          stroke: [
            { test: "sliceYBrush.state === 'resizing'", value: "#ABB9C8" },
            { value: null }
          ],
          strokeWidth: [
            {
              test:
                "sliceYBrush.state === 'resizing' || sliceYBrush.state === 'stop'",
              value: 2
            },
            { value: 0 }
          ],
          fill: [
            { test: "sliceYBrush.state === 'resizing'", value: "#8b9bac" },
            { value: null }
          ],
          width: { signal: "width" },
          fillOpacity: {
            signal: "(sliceYBrush.state === 'resizing') ? 0.2 : 0"
          },
          zindex: { signal: "sliceYBrush.state === 'resizing' ? 10 : -100" },
          y: {
            signal:
              "sliceYBrush.state === 'resizing' && sliceYBrush.segmentInRange.y[0]"
          },
          y2: {
            signal:
              "sliceYBrush.state === 'resizing' && sliceYBrush.segmentInRange.y[1]"
          }
        }
      }
    }
  ];
  const scales = [
    {
      name: "xScale",
      type: "band",
      domain: { signal: "data('labels')" },
      range: { signal: "xRange" },
      paddingInner: { signal: "paddingCatScale.Inner" },
      paddingOuter: { signal: "paddingCatScale.Outer" }
    },
    {
      name: "yScale",
      type: "band",
      domain: { signal: "data('labelsHORIZONTAL')" },
      range: { signal: "yRange" },
      paddingInner: { signal: "paddingCatScale.Inner" },
      paddingOuter: { signal: "paddingCatScale.Outer" }
    },
    {
      name: "colorFull",
      type: "linear",
      domain: { data: "table", field: "PivotedAnasenValues" },
      range: [
        "#7F9FF3",
        "#FFA666",
        "#6BD27B",
        "#FD7473",
        "#BE96EB",
        "#A67A71",
        "#FFA3C4",
        "#BABABA",
        "#FFE040",
        "#6CD8D2"
      ]
    },
    {
      name: "colorLight",
      type: "linear",
      domain: { data: "table", field: "PivotedAnasenValues" },
      range: [
        "#D9E3FC",
        "#FFE5D2",
        "#D3F2D8",
        "#FFD6D5",
        "#ECE0F9",
        "#E5D8D5",
        "#FFE4EE",
        "#EBEBEB",
        "#FFF6C6",
        "#D3F4F2"
      ]
    }
  ].concat(scaleLevels);

  const axes = [
    {
      scale: "xScale",
      orient: "top",
      zindex: -1,
      domainColor: "#DFE6ED",
      ticks: false,
      labelPadding: 5,
      labelFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
      labelFontSize: 11,
      labelFontWeight: 400,
      labelLineHeight: "13px",
      labelColor: "#66788A",
      labelOverlap: "parity",
      labelSeparation: 0,
      labelFlush: true,
      labelBound: 5,
      encode: {
        labels: {
          name: "catAxisLabels",
          update: {
            text: { signal: "peek(datum.value)" },
            angle: { signal: "CatLabelParam.angle" },
            baseline: { signal: "CatLabelParam.baseline" },
            align: { signal: "CatLabelParam.align" },
            limit: { signal: "CatLabelParam.limit" },
            opacity: [
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(N-1))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0] <0",
                value: 0
              },
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(N-1))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0]>width",
                value: 0
              },
              { value: 1 }
            ],
            fill: [
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(N-1))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0] <0",
                value: null
              },
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(N-1))*(1/(2*paddingCatScale.Outer+N*(1-paddingCatScale.Inner)+((N-1)*paddingCatScale.Inner)))*span(xRange)+xRange[0] >width",
                value: null
              },
              { value: "#66788A" }
            ]
          },
          hover: {}
        },
        axis: {
          name: "GroupAxisX",
          interactive: {
            signal:
              "eventProxy.event !== 'drawingshape' && eventProxy.event !== 'startdrawingshape'"
          },
          enter: {
            width: { signal: "min(width,tableWidth)" },
            height: { signal: "-CatLabelParam.height" },
            clip: { value: true }
          },
          update: {
            width: { signal: "min(width,tableWidth)" },
            height: { signal: "-CatLabelParam.height" },
            clip: { value: true },
            fill: { signal: "'transparent'" },
            opacity: { value: 0.05 },
            stroke: { signal: "'transparent'" },
            strokeWidth: { value: 3 },
            cornerRadius: { value: 5 }
          }
        }
      }
    },
    {
      scale: "yScale",
      orient: "left",
      title: {
        signal:
          `peek(data('chartStruct')[0].OrderInfoHOR.Order) === 'PivotedAnasenColumns'
          ? 'Columns'
          : peek(data('chartStruct')[0].OrderInfoHOR.Order)`
      },
      zindex: -1,
      domainColor: "#DFE6ED",
      ticks: false,
      labelPadding: 5,
      labelFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
      labelFontSize: 11,
      labelFontWeight: 400,
      labelLineHeight: "13px",
      labelColor: "#66788A",
      labelOverlap: "parity",
      labelSeparation: 0,
      labelFlush: true,
      labelBound: 5,
      titlePadding: 0,
      titleFont: "Inter var, Inter ,Helvetica Neue,Arial,sans-serif",
      titleFontSize: 13,
      titleFontWeight: 700,
      titleLineHeight: 16,
      titleColor: "#374B5F",
      titleAnchor: "start",
      titleAngle: 0,
      titleAlign: "center",
      titleBaseline: "bottom",
      titleX: -55,
      titleY: 0,
      encode: {
        domain: {
          update: {
            y: { signal: "0" },
            y2: { signal: "height" },
            x: { signal: "-2.5" }
          }
        },
        labels: {
          interactive: false,
          name: "catAxisLabelsHORIZONTAL",
          update: {
            text: { signal: "peek(datum.value)" },
            angle: { value: "0" },
            baseline: { value: "middle" },
            align: { value: "right" },
            limit: { signal: "110-40" },
            opacity: [
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(NHOR-1))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0] <0",
                value: 0
              },
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(NHOR-1))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0]>height",
                value: 0
              },
              { value: 1 }
            ],
            fill: [
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(NHOR-1))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0] <0",
                value: "transparent"
              },
              {
                test:
                  "(paddingCatScale.Outer+1/2*(1-paddingCatScale.Inner)+datum.index*(NHOR-1))*(1/(2*paddingCatScale.Outer+NHOR*(1-paddingCatScale.Inner)+((NHOR-1)*paddingCatScale.Inner)))*span(yRange)+yRange[0] >height",
                value: "transparent"
              },
              { value: "#66788A" }
            ]
          }
        },
        axis: {
          name: "GroupAxisY",
          interactive: {
            signal:
              "eventProxy.event !== 'drawingshape' && eventProxy.event !== 'startdrawingshape'"
          },
          enter: {
            width: { signal: "-110" },
            height: { signal: "min(height,tableHeight)" },
            clip: { value: true }
          },
          update: {
            width: { signal: "-110" },
            height: { signal: "min(height,tableHeight)" },
            clip: { value: true },
            fill: { signal: "'transparent'" },
            stroke: { signal: "'transparent'" },
            strokeWidth: { value: 3 },
            cornerRadius: { value: 5 }
          }
        }
      }
    }
  ];

  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width,
    height: height,
    autosize: { type: "none", resize: true },
    padding: { top: 210, right: 10, bottom: 1, left: 220 },
    data,
    signals,
    marks,
    scales,
    axes,
    config: {
      axis: {
        domain: false,
        tickSize: 3,
        tickColor: "#888",
        labelFont: "Inter, Courier New"
      }
    }
  };
};

export default vegaSpec;
