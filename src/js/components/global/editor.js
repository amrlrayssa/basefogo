import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {EditorState} from "@codemirror/state"
import {indentWithTab} from "@codemirror/commands"

var codeArea = document.getElementById("codeToExecute")

const minHeightEditor = EditorView.theme({
    ".cm-content, .cm-gutter": {minHeight: "200px"}
})

/**
 * The object of the CodeMirror's code editor in the phase. 
 * @constant {EditorView}
 */
export const editor = new EditorView({
    extensions: [basicSetup, minHeightEditor,keymap.of([indentWithTab])],
    parent: codeArea,
})
/**
 * A Codemirror's editor state configured to read only.
 * @constant {EditorState}
 */
export const readOnlyState = EditorState.create({
    extensions:[basicSetup,EditorView.editable.of(false)]
})