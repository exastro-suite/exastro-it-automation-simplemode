export const downloadFile = (base64Code: any, name:string)=> {
    var bstr = window.atob(base64Code),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    let blob = new Blob([u8arr]);
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
}
import ExcelJS from "exceljs";
import axios from 'axios';

const borderStyles_TLD:any = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
};
const borderStyles_TB:any = {
  top: { style: 'thin' },
  bottom: { style: 'thin' },
};
const borderStyles_TBR:any = {
  top: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};
const borderStyles_TLBR:any = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
}

const borderStyles_LR:any = {
  left: { style: 'thin' },
  right: { style: 'thin' },
}

const borderStyles_LRB:any = {
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
}
const borderStyles_R:any = {
  right: { style: 'thin' },
}
const borderStyles_B:any = {
  bottom: { style: 'thin' },
}

const  fillStyle_DAEEF3: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'DAEEF3' }
};

const  fillStyle_99CCFF: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '99CCFF' }
};
const  fillStyle_FFFFFF: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFF' }
};
const matchingG = new RegExp(/^g\d+$/);
let file_inx: number = 0;
let now_date: string = "";
let dataTime: string = "";
let documentName: any = null;
let greator: any = null;
let versionNum: any = null;

// 選択したパラメータシートを標準フォーマットで一つExcelに出力
export const assembleData4Gp = async(columnHeaders: any, columnDatas: any, workbook: ExcelJS.Workbook, inputOrderInfos: any,parameterSheetInfos:any,file_rows:any,operationName:string,catalogue:any) => {
  for (let index = 0; index < inputOrderInfos.length; index++) {
    isFri = true;
    const element = inputOrderInfos[index];
    const keys = Object.keys(element);
    let parameterSheetRestName:any = keys[0];
    let parameterSheetinfo:any = parameterSheetInfos[parameterSheetRestName]
    let parameterName:any  = parameterSheetinfo["parametername"];
    let category:any  = parameterSheetinfo["category"];
    let groupNum: any = parameterSheetinfo["groupnum"];
    let categorynum: any = parameterSheetinfo["categorynum"];
    let maincatalogue:string = categorynum + category;
    let sheetName: any = groupNum + parameterName;
    let file_row: any = file_rows[parameterSheetRestName];
    
    // Data processing
    let inputOrderInfo = element[parameterSheetRestName];
    let inputOrderInfoLength = inputOrderInfo.length
    let start_row_idx = 0;
    let header_start_col_idx:any = 0;
    let data_start_col_idx: any = 0;
    // Create a target Worksheet
    const existingNames: any = workbook.worksheets.map(sheet => sheet.name);
    const newSheetName:any = sanitizeSheetName(sheetName, existingNames);
    workbook = createTargetWorksheet(workbook, "Parameter_Template", newSheetName ,category,parameterName);
    const targetWorksheet = workbook.getWorksheet(newSheetName);
    if (targetWorksheet == undefined) {
      continue;
    }
    catalogue["operation"] = operationName;
    catalogue["date"] = now_date;
    let contents: any = catalogue["contents"]
    if (contents == undefined) {
      catalogue["contents"] = {};
      contents = catalogue["contents"];
    }
    if (maincatalogue in catalogue["contents"]) {
      contents[maincatalogue].push(sheetName);
    } else {
      contents[maincatalogue] = [sheetName];
      if (catalogue["rowcount"] == undefined) {
        catalogue["rowcount"] = 0;
      }
    }
    catalogue["rowcount"] = catalogue["rowcount"] + 1;
    if (catalogue["rowcount"] > 22) {
      if ("addrowcount" in catalogue) {
        catalogue["addrowcount"] = catalogue["addrowcount"] + 1;
      } else {
        catalogue["addrowcount"] = 1
      }
    }
    file_inx = 0;
    if (inputOrderInfoLength > 0) {
      let columnHeader = columnHeaders[parameterSheetRestName];
      let columnData = columnDatas[parameterSheetRestName];
      targetWorksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (cell.type === ExcelJS.ValueType.Formula) {
            cell.value = { formula: cell.formula, result: cell.result };
            let isformulaCell: any = targetWorksheet.getCell(1, colNumber);
            if (isformulaCell.value == 'ドキュメント名') {
              documentName = cell.result;
            }
            if (isformulaCell.value == '作成者') {
              greator = cell.result;
            }
            if (isformulaCell.value == '版') {
              versionNum = cell.result;
            }
          }
          if (cell.value == "$date") {
            cell.value = now_date;
          }
          if (cell.value == "設定値") {
            data_start_col_idx = cell.col;
          }
          if (cell.value == "$setting") {
            start_row_idx = rowNumber;
            header_start_col_idx = cell.col;
            cell.value = "Parameter";
            for (let fill_index = 1; fill_index <= 27; fill_index++) {
              const cell_fill = targetWorksheet.getCell(rowNumber, fill_index);
              cell_fill.fill = fillStyle_DAEEF3;
            }
            targetWorksheet.getCell(rowNumber, 1).border = borderStyles_TLD;
            targetWorksheet.getCell(rowNumber, 2).border = borderStyles_TB;
            targetWorksheet.getCell(rowNumber, 3).border = borderStyles_TB;
            targetWorksheet.getCell(rowNumber, 4).border = borderStyles_TLBR;
            targetWorksheet.getCell(rowNumber, 5).border = borderStyles_TLBR;
            targetWorksheet.getCell(rowNumber, 6).border = borderStyles_TLD;
            for (let index_io = 4; index_io <= 27; index_io++) {
              targetWorksheet.getCell(rowNumber, index_io).border = borderStyles_TB;
            }
            targetWorksheet.getCell(rowNumber, 27).border = borderStyles_TBR;
          }
        });
      });
      // create Parameter Headers
      let row_id: number = start_row_idx + 1;
      let inputOrderInfo = element[parameterSheetRestName];
      let colIndex = header_start_col_idx;
      let rowIndex = row_id;
      let endIndex = colIndex + 1;
      let has_inster_row = false;
      let inster_col_count = 2
      columnHeader.forEach((info: any) => {
        if (typeof info !== "string") {
          let sub_gp_count = info['sub_gp_count']
          if (sub_gp_count > 0) {
            has_inster_row = true;
            for (let index = 0; index < sub_gp_count; index++) {
              targetWorksheet.spliceColumns(endIndex + 1, 0, []);
              targetWorksheet.spliceColumns(endIndex + 2, 0, []);
              endIndex = endIndex + 2;
            }
            inster_col_count = sub_gp_count * 2 + inster_col_count;
          }
        }
      });
      // new column set Styles
      for (let fill_index = colIndex; fill_index <= endIndex && has_inster_row; fill_index++) {
        const cell_fill = targetWorksheet.getCell(1, fill_index);
        const cell_fill3 = targetWorksheet.getCell(4, fill_index);
        const cell_fill6 = targetWorksheet.getCell(7, fill_index);
        const cell_fill7 = targetWorksheet.getCell(8, fill_index);
        targetWorksheet.getCell(1, fill_index).border = borderStyles_TB;
        targetWorksheet.getCell(2, fill_index).border = borderStyles_TB;
        targetWorksheet.getCell(4, fill_index + 1).border = borderStyles_TB;
        
        targetWorksheet.getCell(5, fill_index + 1).border = borderStyles_TB;
        targetWorksheet.getCell(7, fill_index).border = borderStyles_TB;
        targetWorksheet.getCell(8, fill_index).border = borderStyles_TB;
        if (fill_index == endIndex) {
          targetWorksheet.getCell(8, fill_index).border = borderStyles_TBR;
        }
        
        cell_fill.fill = fillStyle_99CCFF;
        cell_fill3.fill = fillStyle_99CCFF;
        cell_fill6.fill = fillStyle_99CCFF;
        cell_fill7.fill = fillStyle_DAEEF3;
        targetWorksheet.getCell(2, fill_index).fill = fillStyle_FFFFFF
        targetWorksheet.getCell(3, fill_index).fill = fillStyle_FFFFFF
        targetWorksheet.getCell(5, fill_index + 1).fill = fillStyle_FFFFFF
        targetWorksheet.getCell(6, fill_index).fill = fillStyle_FFFFFF
      }
      targetWorksheet.getCell(5, 1).border = borderStyles_LRB;
      for (let index_inputOrderInfo = 0; index_inputOrderInfo < inputOrderInfo.length; index_inputOrderInfo++) {
        columnHeader.forEach((info: any) => {
            let groupinfo = info['g1']
            let columnsName = info["columnsName"]
            let main_group_name = info['main_group_name']
            rowIndex = processColumnHeader(info, targetWorksheet, groupinfo, rowIndex, colIndex, columnsName, file_row, inster_col_count,main_group_name);
        });
      }

      // set data
      let data_start_row = row_id - 1;
      let data_start_col = endIndex + 1 ;
      let col_width = targetWorksheet.getColumn(data_start_col).width
      let row_count = 0
      // columnData
      for (let index_data = 0; index_data < columnData.length; index_data++) {
        if (index_data == 0) {
          targetWorksheet.getCell(8, data_start_col).border = borderStyles_TLBR;
        }
        
        // column inster
        if (index_data > 0) {
          targetWorksheet.spliceColumns(data_start_col, 0, []);
          targetWorksheet.getColumn(data_start_col).width = col_width;
          const cell_fill = targetWorksheet.getCell(1, data_start_col);
          const cell_fill2 = targetWorksheet.getCell(2, data_start_col);
          const cell_fill3 = targetWorksheet.getCell(4, data_start_col);
          const cell_fill5 = targetWorksheet.getCell(5, data_start_col);
          const cell_fill6 = targetWorksheet.getCell(7, data_start_col);
          const cell_fill7 = targetWorksheet.getCell(8, data_start_col);

          const cell_fill8 = targetWorksheet.getCell(3, data_start_col);
          const cell_fill9 = targetWorksheet.getCell(6, data_start_col);

          targetWorksheet.getCell(1, data_start_col).border = borderStyles_TB;
          targetWorksheet.getCell(2, data_start_col).border = borderStyles_TB;
          targetWorksheet.getCell(4, data_start_col).border = borderStyles_TB;
          targetWorksheet.getCell(5, data_start_col).border = borderStyles_TB;
          targetWorksheet.getCell(7, data_start_col).border = borderStyles_TB;
          targetWorksheet.getCell(8, data_start_col).border = borderStyles_TLBR;
          cell_fill.fill = fillStyle_99CCFF;
          cell_fill2.fill = fillStyle_FFFFFF;
          cell_fill3.fill = fillStyle_99CCFF;
          cell_fill6.fill = fillStyle_99CCFF;
          cell_fill5.fill = fillStyle_FFFFFF;
          cell_fill7.fill = fillStyle_DAEEF3;
          cell_fill8.fill = fillStyle_FFFFFF;
          cell_fill9.fill = fillStyle_FFFFFF;
        }
        
        const element_data = columnData[index_data];
        targetWorksheet.getCell(data_start_row, data_start_col).value = element_data['hostName'];
        targetWorksheet.getCell(data_start_row, data_start_col).alignment = { wrapText: true,vertical:'top' };

        data_start_row++;
        const datas = element_data['data'];
        for (let dt_index = 0; dt_index < datas.length; dt_index++) {
          const sub_data = datas[dt_index]
          for (let sub_index = 0; sub_index < sub_data.length; sub_index++) {
            targetWorksheet.getCell(data_start_row, data_start_col).value = sub_data[sub_index];
            targetWorksheet.getCell(data_start_row, data_start_col).alignment = { wrapText: true,vertical:'top' };
            targetWorksheet.getCell(data_start_row, data_start_col).border = borderStyles_TLBR;
            if (index_data == 0) {
              row_count++;
            }
            data_start_row++
          }
        }
        data_start_row = row_id - 1;
        data_start_col++;
      }

      //備考欄のStylesを設定
      data_start_row = row_id;
      for (let index_r = 0; index_r < row_count; index_r++) {
        let bk_start_col = data_start_col;
        for (let index_bk = 1; index_bk <= 24; index_bk++) {
          
          let bk_cell = targetWorksheet.getCell(data_start_row, bk_start_col);
          bk_cell.border = borderStyles_B;
          bk_cell.fill = fillStyle_FFFFFF;
          if (index_bk == 24 ) {
            bk_cell.border =  {
              ...bk_cell.border,
              right: { style: 'thin' },
            };
          }
          bk_start_col++;
        }
        data_start_row ++;
      }
      // Parameter欄のStylesを設定
      data_start_row = row_id;
      let p_group_name:any = [];
      for (let index_r = 0; index_r < row_count; index_r++) {
        for (let fill_index = colIndex; fill_index <= endIndex; fill_index++) {
          let cell_rn = targetWorksheet.getCell(data_start_row, fill_index);
          cell_rn.fill = fillStyle_FFFFFF;
        }
        let cell_tow = targetWorksheet.getCell(data_start_row, 2);
        if (p_group_name.indexOf(targetWorksheet.getCell(data_start_row, 1).value) === -1 && targetWorksheet.getCell(data_start_row, 1).value != null) {
          p_group_name.push(targetWorksheet.getCell(data_start_row, 1).value)
        }
        cell_tow.border = {
          ...cell_tow.border,
          right: { style: 'thin' },
        };
        data_start_row++;
      }

      
      if (p_group_name.length == 1) {
        data_start_row = row_id;
        for (let index_r = 0; index_r < row_count; index_r++) {
          let cell_1 = targetWorksheet.getCell(data_start_row, 1);
          let cell_2 = targetWorksheet.getCell(data_start_row, 2);
          cell_1.border = {};
          cell_2.border = { right: { style: 'thin' }, };
          if (index_r == row_count - 1) {
            cell_1.border = {
              ...cell_1.border,
              bottom: { style: 'thin' },
            };
            cell_2.border = {
              right: { style: 'thin' },
              bottom: { style: 'thin' },
            };
          }
          data_start_row++;
        }
      }
    }
    targetWorksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (cell.type === ExcelJS.ValueType.Formula) {
          cell.value = { formula: cell.formula, result: cell.result };
          let isformulaCell: any = targetWorksheet.getCell(1, colNumber);
          if (isformulaCell.value == 'ドキュメント名') {
            cell.value = { formula: cell.formula, result: documentName };
          }
          if (isformulaCell.value == '作成者') {
            cell.value = { formula: cell.formula, result: greator };
          }
          if (isformulaCell.value == '版') {
            cell.value = { formula: cell.formula, result: versionNum };
          }
        }
      })
    });
  }
  return workbook;
}
let isFri = true;
const processColumnHeader = (info: any, targetWorksheet: ExcelJS.Worksheet, groupinfo: any, rowIndex: number, colIndex: number,columnsName:any,file_row:any,inster_col_count:number,main_group_name:any) => {
  let columns = groupinfo["columns"];
  main_group_name;
  for (let index = 0; index < columns.length; index++) {
    const element = columns[index];
    if (element.match(matchingG)) {
      let groupinfo_sub = info[element];
      let name = groupinfo_sub["column_group_name"];
      let nowcell = targetWorksheet.getCell(rowIndex, colIndex);
      nowcell.alignment = { vertical:'top' };
      if (isFri) {
        isFri = false;
        nowcell.value = name;
      }
      if (!main_group_name.includes(name)) {
        nowcell.value = name;
      }
      nowcell.border = {
        ...nowcell.border,
        left: { style: 'thin' },
      }
      nowcell = targetWorksheet.getCell(rowIndex, colIndex + 1);
      nowcell.alignment = { vertical:'top' };
      nowcell.border = {
        ...nowcell.border,
        right: { style: 'thin' },
      }
      let sub_group = groupinfo_sub["columns"].length;
      for (let index_sub_group = 1; index_sub_group < sub_group; index_sub_group++) {
        let cell_d = targetWorksheet.getCell(rowIndex + index_sub_group, colIndex);
        cell_d.alignment = { vertical:'top' };
        cell_d.border = {
          ...cell_d.border,
          left: { style: 'thin' },
        }
        cell_d = targetWorksheet.getCell(rowIndex + index_sub_group, colIndex + 1);
        cell_d.alignment = { vertical:'top' };
          cell_d.border = {
            ...cell_d.border,
            right: { style: 'thin' },
          }
      }
      rowIndex = processColumnHeader(info, targetWorksheet, groupinfo_sub, rowIndex, colIndex + 2, columnsName, file_row, inster_col_count,main_group_name);
      nowcell = targetWorksheet.getCell(rowIndex - 1, colIndex);
      nowcell.alignment = { vertical:'top' };
      nowcell.border = {
        ...nowcell.border,
            bottom: { style: 'thin' },
      }
      nowcell = targetWorksheet.getCell(rowIndex - 1, colIndex + 1);
      nowcell.alignment = { vertical:'top' };
      nowcell.border = {
        ...nowcell.border,
            bottom: { style: 'thin' },
      }
    } else {
      let file_str  = columnsName[element]
      targetWorksheet.getCell(rowIndex, colIndex).value = columnsName[element];
      targetWorksheet.getCell(rowIndex, colIndex).alignment = {vertical:'top' };
      if (file_str == "file") {
        let count = file_row[file_inx];
        for (let index_count = 1; index_count < count; index_count++) {
          rowIndex ++;
        }
        file_inx++;
      }
      for (let index_border = colIndex; index_border <= inster_col_count + 1; index_border++) {
        let cell_d = targetWorksheet.getCell(rowIndex, index_border);
        cell_d.alignment = {vertical:'top' };
        if (index_border == colIndex) {
          cell_d.border = {
            ... cell_d.border,
            bottom: { style: 'thin' },
            left: { style: 'thin' },
          }
        }
        cell_d.border = {
            ... cell_d.border,
            bottom: { style: 'thin' },
          }
      }
      rowIndex ++;
    }
  }
  return  rowIndex;
}

export const downloadSysFile = async (buffer: any,catalogue:any,fileName: string = 'parametersheet_') => {
  // Generate a buffer from the workbook and trigger download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}_` + catalogue["operation"] + '_' + `${dataTime}.xlsx`;
  //データの初期値を設定。
  file_inx = 0;
  now_date = "";
  dataTime = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const assembleCatalog = async (workbook: ExcelJS.Workbook,catalogue:any) => {
  let catalogWorksheet = workbook.getWorksheet("目次");
  
  let startrowNumber = 0;
  let startcolNumber = 0;
  catalogWorksheet?.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value == "$operation") {
        cell.value = catalogue["operation"];
      }
      if (cell.value == "$date") {
        cell.value = catalogue["date"];;
      }
      if (cell.value == "$contents") {
        startrowNumber = rowNumber;
        startcolNumber = colNumber;
      }
    });
  });
  if ("addrowcount" in catalogue) {
    let addrowcount = catalogue["addrowcount"];
    for (let index = 0 ; catalogWorksheet != undefined && index < addrowcount; index++) {
      catalogWorksheet.spliceRows(34 + index, 0, []);
      catalogWorksheet.getCell(34 + index, 50).border = borderStyles_R;
    }
  }
  let contents = catalogue["contents"];
  const keys = Object.keys(contents);
  for (let index = 0; catalogWorksheet != undefined && index < keys.length; index++) {
    const key = keys[index];
    catalogWorksheet.getCell(startrowNumber, startcolNumber).value = key;
    startrowNumber++;
    let content = contents[key];
    content.forEach((element:any) => {
      catalogWorksheet!.getCell(startrowNumber, startcolNumber + 1).value = element;
      startrowNumber++;
    });
  }
}

export const loadExcelTemplate = async (filename: any = "template_ja.xlsx") => {
  const response = await axios.get(`/${filename}`, {
    responseType: 'arraybuffer'
  });
  // Create a new workbook instance
  const workbook = new ExcelJS.Workbook();
  // Load the buffer data into the workbook
  await workbook.xlsx.load(response.data);

  //now date
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
  let date = now.getDate() >= 10 ? now.getDate() : `0${now.getDate()}`;
  const hour = now.getHours() >= 10 ? now.getHours() : `0${now.getHours()}`;
  const minutes = now.getMinutes() >= 10 ? now.getMinutes() : `0${now.getMinutes()}`;
  const seconds = now.getSeconds() >= 10 ? now.getSeconds() : `0${now.getSeconds()}`;
  now_date = `${year}/${month}/${date}`;
  dataTime = `${year}${month}${date}${hour}${minutes}${seconds}`;
  return workbook;
}

export const downloadSysExcelFile = async(workbook: ExcelJS.Workbook,catalogue:any) => {
  // delete taget weWorksheet
  workbook.removeWorksheet("Parameter_Template");
  // Generate a buffer from the workbook and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  downloadSysFile(buffer,catalogue);
}

const sanitizeSheetName = (name:any, existingNames:any) => { 
  const invalidChars = /[:\\/?*[\]]/g;
  let sanitized = name.replace(invalidChars, '');
  sanitized = sanitized.substring(0, 31);
  let uniqueName = sanitized;
  let counter = 1;
  while (existingNames.includes(uniqueName)) {
    uniqueName = `${sanitized.substring(0, 28)}_${counter}`;
    counter++;
  }
  return uniqueName;
}

const createTargetWorksheet = (workbook:ExcelJS.Workbook,objectiveSheetName:string,newSheetName:string,category:string,parameterName:string) => {
  // Access the first worksheet
  const originalWorksheet = workbook.getWorksheet(objectiveSheetName);
  if (!originalWorksheet) {
    throw new Error(`Worksheet with name ${objectiveSheetName} not found.`);
  }
  const newWorksheet = workbook.addWorksheet(newSheetName);
  originalWorksheet.columns.forEach((col, index) => {
    if (col.width) {
      newWorksheet.getColumn(index + 1).width = col.width;
    }
  });
  // Copy each row from the original worksheet to the new worksheet
  originalWorksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const newRow = newWorksheet.getRow(rowNumber);
    if (row.height) {
      newWorksheet.getRow(rowNumber).height = row.height;
    }
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const newCell = newRow.getCell(colNumber);
      if (cell.type === ExcelJS.ValueType.Formula) {
        newCell.value = { formula: cell.formula, result: cell.result };
      } else {
        newCell.value = cell.value;
      }
      newCell.style = { ...cell.style }; // Copy cell style
      if (cell.value == "$category") {
        newCell.value = category;
      }
      if (cell.value == "$parametersheet") {
        newCell.value = parameterName;
      }
    });
  });
  // Copy merged cells
  originalWorksheet.model.merges.forEach(merge => {
    newWorksheet.mergeCells(merge);
  });
  return workbook;
}
