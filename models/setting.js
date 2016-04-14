var mongoose = require('mongoose');

var SettingSchema = new mongoose.Schema({
  password: {
    // パスワード最小桁数
    minLength: {type: Number, default: 8},

    // パスワード最大桁数
    maxLength: {type: Number, default: 15},

    // パスワード間違え時にロックするか
    enabledLockout: {type: Boolean, default: true},

    // パスワード間違えの最大試行回数
    // enabledLockoutがtrueの時有効
    lockoutCount: {type: Number, default: 5},

    // パスワードに半角英大文字を含むことを強制
    mustIncludeUpperCase: {type: Boolean, default: true},

    // パスワードに半角英小文字を含むことを強制
    mustIncludeLowerCase: {type: Boolean, default: true},

    // パスワードに半角記号を含むことを強制
    mustIncludeSymbolCase: {type: Boolean, default: true},

    // パスワードに半角数字を含むことを強制
    mustIncludeNumberCase: {type: Boolean, default: true},

    // パスワードにIDを含まないことを強制
    mustExcludeId: {type: Boolean, default: true},

    // パスワードの再利用を可能とするか
    disabledReuse: {type: Boolean, default: false},

    // パスワードの再利用可能の場合、過去何回前のものは利用可能とするか
    // enabledReuseがtrueの時有効
    reuseExpireCount: {type: Number, default: 8},

    // パスワード有効期限までの日数
    // パスワード設定時のシステム日付＋設定した日数＝有効期限
    expireDateCount: {type: Number, default: 365},

    // 同日に複数回のパスワードを許可するか
    disabledMultipleUpdateSameday: {type: Boolean, defalut: false}
  }
});

module.exports = mongoose.model('Setting', SettingSchema);
