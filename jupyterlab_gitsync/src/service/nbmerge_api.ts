const diff3 = require('diff3');
const diff = require('diff');

export function mergeNotebooks(base, local, remote){
  const merged = mergeMetadata(base, local, remote);
  const result = mergeCells(base, local, remote);

  if (result.conflict){
    return;
  }
  merged.cells = result.cells;
  return { content: merged, conflict: result.conflict, source: result.source};
}

function mergeMetadata(base, local, remote){
  return base;
}

const cell_divider = '@#$%%^&*!#$&(@%^@%@%@#%$';
function mergeCells(base, local, remote){
  const base_str = getContents(base.cells, cell_divider);
  const local_str = getContents(local.cells, cell_divider);
  const remote_str = getContents(remote.cells, cell_divider);

  /* Merge Source Contents as String */
  const merged = diff3(remote_str, base_str, local_str);
  
  var merged_str = null;
  const conflict = isConflict(merged);
  if (conflict){
    // merged_str = getConflictContent(merged);
    return;
  } else {
    merged_str = merged[0].ok.join('');
  }

  /* Map to correct cell for metadata */ 
  const merged_source = merged_str.split(cell_divider+'\n');
  const mapping = mapMergedCells(base_str, local_str, remote_str, merged_str);

  /* Using op mapping, get correct metadata */
  var cells = []
  var l = 0, r = 0, m = 0, b=0; i = 0;
  while(i < mapping.length){
    if(mapping[i].op === null){
      var cell = mergeCellMetadata(base.cells[b], local.cells[l], remote.cells[r]);
      cell.source = merged_source[m];
      cells.push(cell);
      l++; r++; m++; b++; 
    } else if (mapping[i].op === 'removed'){
      if (mapping[i].modifier == 'local'){ b++; r++;}
      if (mapping[i].modifier == 'remote'){ b++; l++;}
    } else if (mapping[i].op === 'added'){
      var cell = null;
      if (mapping[i].modifier == 'local'){ cell = local.cells[l]; l++; m++;}
      if (mapping[i].modifier == 'remote'){ cell = remote.cells[r]; r++; m++;}
      delete cell.metadata.trusted;
      cells.push(cell);
    } else if (mapping[i].op === 'modified'){
      var cell = mergeCellMetadata(base.cells[b], local.cells[l], remote.cells[r]);
      cell.source = merged_source[m];
      cells.push(cell);
      l++; r++; m++; b++;
    }
    i++;
  }
  return {cells: cells, conflict: conflict, source: merged_source};
}

function getContents(cells, divider){
  var contents = '';
  for (var i = 0; i<cells.length; i++){
    var cell = cells[i];
    var text = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
    
    contents += text + '\n' + divider +'\n';
  }
  return contents;
}

function isConflict(merged){
  return merged.length > 1 || !merged[0] || merged[0].conflict;
}

function mapMergedCells(base_str, local_str, remote_str, merged_str){
  const local_diff = diff.diffLines(base_str, local_str);
  const remote_diff = diff.diffLines(base_str, remote_str);
  const merged_diff = diff.diffLines(base_str, merged_str);

  const local_ops = getDiffOps(local_diff);
  const remote_ops = getDiffOps(remote_diff);
  const merged_ops = getDiffOps(merged_diff);

  var mapping = []
  var l = 0, r = 0, m = 0;
  while((l < local_ops.length || r < remote_ops.length) && m < merged_ops.length){
    if(merged_ops[m] == 'removed'){
      var modifier = (local_ops[l] == 'removed') ? 'local' : 'remote';
      mapping.push({op: 'removed', modifier: modifier});
    } else if (merged_ops[m] == 'modified') {
      var modifier = (local_ops[l] == 'modified') ? 'local' : 'remote';
      if (modifier == 'local' && remote_ops[r] == 'modified'){ modifier = 'both'; }
      mapping.push({op: 'modified', modifier: modifier});
    } else if (merged_ops[m] == 'added') {
      var modifier = (local_ops[l] == 'added') ? 'local' : 'remote';
      mapping.push({op: 'added', modifier: modifier});
      if (modifier == 'local') { r--; }
      if (modifier == 'remote') { l--; }
    } else if (merged_ops[m] == 'unmodified') {
      mapping.push({op: null, modifier: null});
    }
    l++; 
    r++;
    m++;
  }
  return mapping;
}

function getDiffOps(diff){
  var ops = [];
  var curr_type = null;

  for (var i=0; i<diff.length; i++){
    var diff_type = getDiffEntryType(diff[i]);
    var cells = diff[i].value.split(cell_divider+'\n');

    for (var j=0; j<cells.length; j++){
      if (cells[j] != ''){
        curr_type = joinType(curr_type, diff_type)
      }
      if (j!= cells.length -1){
        ops.push(curr_type);
        curr_type = null;
      }
    }
  }
  return ops;
}

function joinType(original, updated){
  if (original === null){
    return updated;
  } else if (original === "unmodified" && updated !== "unmodified"){
    return "modified";
  } else {
    return "modified";
  }
}

function getDiffEntryType(diffEntry){
  if (diffEntry.added){
    return "added";
  } else if (diffEntry.removed){
    return "removed";
  } else {
    return "unmodified";
  }
}

function stripCellMetadata(cell){
  var cell_meta = cell;
  cell_meta.source = null;
  delete cell_meta.metadata.trusted;
  return cell_meta;
}
function mergeCellMetadata(base, local, remote){
  const base_meta = stripCellMetadata(base);
  const local_meta = stripCellMetadata(local);
  const remote_meta = stripCellMetadata(remote);

  if(_.isEqual(local_meta, base_meta) && _.isEqual(remote_meta, base_meta)){
    return base_meta;
  } else if (_.isEqual(local_meta, base_meta) && !_.isEqual(remote_meta, base_meta)){
    return remote_meta;
  } else if (!_.isEqual(local_meta, base_meta) && _.isEqual(remote_meta, base_meta)){
    return local_meta;
  } else {
    return local_meta;
  }
}
