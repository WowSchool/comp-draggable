import EventUtil from 'util-events'
cc.Class({
  name: 'Draggable',
  extends: cc.Component,
  editor: CC_EDITOR && {
    help: 'https://code.vipkid.com.cn/lingobus-fe/games/library/comp-draggable/wikis/home'
  },
  properties: {
    draggingZIndex: {
      default: 1000
    },
    draggingCursorStyle: {
      default: 'pointer'
    },
    onDragStartEvent: {
      type: cc.Component.EventHandler,
      default: []
    },
    onDragCancelEvent: {
      type: cc.Component.EventHandler,
      default: []
    },
    passTestByDefault: {
      default: false
    },
    test: {
      type: cc.Component.EventHandler,
      default: null
    },
    testPassAudio: {
      url: cc.AudioClip,
      default: null
    },
    testFailedAudio: {
      url: cc.AudioClip,
      default: null
    }
  },
  onLoad () {
    const n = this.node, canStyl = cc._canvas.style, ET = cc.Node.EventType;

    // save initial node position for restore
    const ix = n.x, iy = n.y, izIndex = n.zIndex;

    const restore = () => {
      n.x = ix;
      n.y = iy;
      n.zIndex = izIndex;
    };
    
    // change cursor style on pc
    if (this.draggingCursorStyle) {
      n.on(ET.MOUSE_ENTER, e => canStyl.cursor = this.draggingCursorStyle);
      n.on(ET.MOUSE_LEAVE, e => canStyl.cursor = 'default');
    }

    n.on(ET.TOUCH_START, e => {
      n.zIndex = this.draggingZIndex;
      EventUtil.emitEvents(this.onDragStartEvent);
    });

    n.on(ET.TOUCH_MOVE, e => {
      const delta = e.touch.getDelta();
      n.x += delta.x;
      n.y += delta.y;
    });

    n.on(ET.TOUCH_END, e => {
      var coord = this.passTestByDefault;
      if(this.test) {
        coord = EventUtil.callHandler(this.test, [e, this]);
      }
      if (coord) {
        if (cc.js.isNumber(coord.x) && cc.js.isNumber(coord.y)) {
          n.x = coord.x;
          n.y = coord.y;
        }
        if (this.testPassAudio) cc.audioEngine.play(this.testPassAudio);
        n.zIndex = izIndex;
      } else {
        if (this.testFailedAudio) cc.audioEngine.play(this.testFailedAudio);
        restore();
      }
    })

    n.on(ET.TOUCH_CANCEL, e => {
      EventUtil.emitEvents(this.onDragStartEvent);
      restore(e);
      e.stopPropagation();
    });
  },
  _dispose (e) {
    e.targetOff(cc.Node.EventType.TOUCH_START);
    e.targetOff(cc.Node.EventType.TOUCH_MOVE);
    e.targetOff(cc.Node.EventType.TOUCH_END);
    e.targetOff(cc.Node.EventType.TOUCH_CANCEL);
  }
});