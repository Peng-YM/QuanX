const body = {
  Hello: "world",
  Outer: {
    A: "a",
    B: "b",
  },
  TOBEDELETE: {
    A: {
      B: "NO",
    },
  },
};
const $ = new Operator(body);
let modified = $.set("Hello", "WOOOORLD")
  .patch("Outer", { PATCHED: "VAL" })
  .delete("TOBEDELETE.A")
  .done();
console.log(modified);
console.log(body);
console.log($.get("Outer"));

function Operator(origin) {
  const model = JSON.parse(JSON.stringify(origin)); // deep copy

  const modify = (expr, value, merge) => {
    const ERR = new Error("Cannot assign an attribute to a string!");
    const _modify = (obj, nodes, value) => {
      const k = nodes[0];
      if (typeof obj === "string") throw ERR;
      if (!obj.hasOwnProperty(k)) obj[k] = {};
      if (nodes.length === 1) {
        if (merge && typeof obj[k] === "string") throw ERR;
        obj[k] = merge ? { ...obj[k], ...value } : value;
        return;
      }
      _modify(obj[k], nodes.slice(1), value);
    };
    _modify(model, expr.split("."), value);
  };

  this.get = (expr) => {
    const _get = (obj, nodes) => {
      if (typeof obj === "undefined") return undefined;
      if (nodes.length === 1) return obj[nodes[0]];
      return _get(obj[nodes[0]], nodes.slice(1));
    };
    return _get(model, expr.split("."));
  };

  this.set = (expr, value) => {
    modify(expr, value, false);
    return this;
  };

  this.patch = (expr, value) => {
    modify(expr, value, true);
    return this;
  };

  this.delete = (expr) => {
    const _delete = (target, nodes) => {
      if (typeof target === "undefined") return;
      if (nodes.length == 1) {
        delete target[nodes[0]];
        return;
      }
      _delete(target[nodes[0]], nodes.slice(1));
    };
    _delete(model, expr.split("."));
    return this;
  };

  this.done = () => {
    return model;
  };
}
