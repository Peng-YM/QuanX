## Gist备份小工具

实现了一个小工具用于备份Box备份到gist。简单列出一些用法：

```javascript
const $gist = GistBox("「填入github的token」"); // 注意需要有读取私有gist的权限
```

在用户gist列表中查找box备份的数据库（即：单个gist）。**id是数据库唯一标识。**

```javascript
// 查询成功，返回数据库id；失败返回-1。
id = await $gist.findDatabase();
```

使用备份数据创建一个新的数据库，注意**由于github限制，不允许创建不包含任何文件的gist**。

```javascript
// backups 是一个数组，每个item的属性为time和content，也可以是单独的一个item
backups = [
  {
    time: "一个时间戳",
    content: "字符串格式的内容"
  },
  {
    ...
  }
];
// 创建成功，返回id；失败则返回Promise.reject并给出错误信息。
id = await $gist.createDatabase(backups);
```

根据id删除数据库：

```javascript
// 失败则返回Promise.reject并给出错误信息。
await $gist.deleteDatabase(id);
```

获取数据库中所有备份。由于备份内容可能非常大，所以该接口只返回备份的URL，内容需要二次获取（比如恢复备份时获取）。**时间戳是某个备份的唯一标识符**。

```javascript
backups = await $gist.getBackups(id);

// 下面是返回数据的样例
backups = [
  {
    time: "时间戳",
    url: "该备份的URL"
  },
  {
    ...
  }
]
```

上传或者修改一个（或者多个）备份。修改的话只要保持时间戳一致即可更新原有备份。

```javascript
// 也可以传入一个数组，每个item格式都和这个一样
backup = {
    time: "一个时间戳",
    content: "字符串格式的内容"
}
await $gist.addBackups(id, backup);
```

删除一个（或者多个）备份。传入时间戳（一个或者数组）即可。

```javascript
timestamps = ['xxx', 'yyy', 'zzz'];
await $gist.deleteBackups(id, timestamps)
```

