qx.Class.define("qxapp.components.workbench.SettingsView", {
  extend: qx.ui.container.Composite,

  construct: function() {
    this.base();

    let box = new qx.ui.layout.VBox(10);
    box.set({
      alignX: "center"
    });

    this.set({
      layout: box,
      padding: 10
    });

    this.__initTitle();
    this.__initSettings();
  },

  events: {
    "SettingsEdited": "qx.event.type.Event",
    "ShowViewer": "qx.event.type.Data"
  },

  properties: {
    node: {
      check: "qxapp.components.workbench.NodeBase",
      apply: "__applyNode"
    }
  },
  members: {
    __settingsBox: null,
    __dynamicViewer: null,

    __initTitle: function() {
      let box = new qx.ui.layout.HBox();
      box.set({
        spacing: 10,
        alignX: "right"
      });
      let titleBox = new qx.ui.container.Composite(box);
      let settLabel = new qx.ui.basic.Label(this.tr("Inputs"));
      settLabel.set({
        alignX: "center",
        alignY: "middle"
      });
      let doneBtn = new qx.ui.form.Button(this.tr("Done"));

      titleBox.add(settLabel, {
        width: "75%"
      });
      titleBox.add(doneBtn);
      this.add(titleBox);

      doneBtn.addListener("execute", function() {
        this.fireEvent("SettingsEdited");
      }, this);
    },

    __initSettings: function() {
      this.__settingsBox = new qx.ui.container.Composite(new qx.ui.layout.Grow());
      this.add(this.__settingsBox);

      this.__dynamicViewer = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      this.add(this.__dynamicViewer);
    },

    __applyNode: function(node, oldNode, propertyName) {
      this.__settingsBox.removeAll();
      this.__settingsBox.add(node.getPropsWidget());

      this.__dynamicViewer.removeAll();
      let viewerButton = node.getViewerButton();
      if (viewerButton) {
        node.addListenerOnce("ShowViewer", function(e) {
          const data = e.getData();
          this.fireDataEvent("ShowViewer", data);
        }, this);
        this.__dynamicViewer.add(viewerButton);
      }
    }
  }
});
