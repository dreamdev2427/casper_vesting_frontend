export const dsUtilNumberWithCommas = (x) => {
    // return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  
    let t = x.toString();
    let decimalPosition = t.indexOf(".");
    if (decimalPosition > 0) {
      let i;
      for (i = decimalPosition - 3; i > 0; i -= 3) {
        t = t.slice(0, i) + "," + t.slice(i);
      }
    }
    return t;
  };