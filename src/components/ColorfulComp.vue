<template>
  <div class="colorful">
    <div style="text-align:left; margin-bottom: 20px; display: flex;">
      <img style="width: 400px;height: 100%" src="../assets/logo-colorful.png" />
    </div>
    <div style="text-align:left;font-size:17px;font-weight:600;margin-bottom:10px;">上传产品</div>
    <div class="flex">
      <div class="left">
        <div class="flex">
          <label>产品名称</label>
          <el-input class="ipt-area" v-model="inputName" placeholder="请输入内容"></el-input>

        </div>
        <div class="flex">
          <label>产品故事</label>
          <el-input class="ipt-area" v-model="inputDesc" type="textarea" rows="4" placeholder="请输入内容"></el-input>

        </div>
        <div class="flex">
          <label>产品图片/video</label>
          <!-- <input class="file-upload" type="file" @change="onChange($event)" /> -->
          <el-upload
            class="upload-demo"
            action="https://ipfs.infura.io/ipfs/"
            :on-change="uploadFile">
            <button class="file-upload">选择文件</button>
            <span>{{fileName ? fileName : "未选择任何文件"}}</span>
          </el-upload>

        </div>
        <div class="flex">
          <label>上市时间</label>
          <el-input class="ipt-area" v-model="inputDate" placeholder="请输入内容"></el-input>

        </div>
        <div class="flex">
          <label>其他参数</label>
          <el-input class="ipt-area" v-model="inputOther" type="textarea" rows="4" placeholder="请输入内容"></el-input>

        </div>
        <div class="flex">
          <label />
          <el-button type="primary" round @click="onUploadInfo">上传产品</el-button>
        </div>
      </div>
      <div class="right">
        <div class="wrapper">
          <div v-show="fileUrl" style="padding-left:7px">
            <img :src="fileUrl" />
          </div>
          <div v-show="!fileUrl" class="no-img">暂无图片</div>
          <div style="padding-left: 7px;">
            <p>产品名称：{{inputName}}</p>
            <p>产品故事：{{inputDesc}}</p>
            <p>上市时间：{{inputDate}}</p>
            <p>产品参数：{{inputOther}}</p>
          </div>

        </div>
      </div>
    </div>
    <!-- ipfs demo -->
    <!-- <div>
      <input type="file" @change="onChange($event)" />
    </div>
    <div v-if="fileUrl">
      <img :src="fileUrl" />
    </div>
    <div v-if="fileUrl">
      <button @click="onUpload">upload</button>
    </div> -->
  </div>
</template>

<script>
import { create } from 'ipfs-http-client'
import {ethers} from 'ethers'
import abi from '../../abi.json'

const ipfs = create('https://ipfs.infura.io:5001/api/v0')

// 合约地址
const contractAddress = "0x0a21139d67449d45a1565d672C51DB52DDAC42E7";

export default {
  name: 'ColorfulComp',
  props: {
    msg: String
  },
  data() {
    return {
      web3: null,
      chainId: null,
      fileUrl: '',
      inputName: '',
      inputDesc: '',
      inputDate: '',
      inputOther: '',
      fileName: ''
    }
  },
  methods: {
    async connect() {
      //此函数是链接用户钱包功能,用来将ethers实例化
      let self = this;
      let web3Provider, web3;
      if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
          // 请求用户授权
          await window.ethereum.enable();
        } catch (error) {
          // 此处用户不给授权的处理逻辑
        }
      } else if (window.web3) {
        //windows.web3是用来适配旧版metamask
        web3Provider = window.web3.currentProvider;
      } else {
        // 处理用户没有metamask的逻辑
      }
      web3 = new ethers.providers.Web3Provider(web3Provider);
      let user = web3.getSigner();
      //ether.js获取chainId等链信息比web3.js简洁且有逻辑的多,直接通过getNetWork即可获得链内容
      let networkInfo = await web3.getNetwork();
      // ethers.js和web3.js不同的点,在于可以直接获得当前钱包地址,通过上面的Signer(user)
      let wallet_address = await user.getAddress();
      console.log(wallet_address, 'wallet_address')
      console.log(web3, 'web3')
      let chainId = networkInfo.chainId;

      self.web3 = web3;
      self.chainId = chainId;
      self.address = wallet_address;
      window.ethereum.on("chainChanged", (chainId) => {
        console.log("用户切换了链", chainId);
      });
      // 连接合约
      let c = await new ethers.Contract(contractAddress, abi, self.web3);
      let signer = self.web3.getSigner();
      console.log(signer, 'signer')

      // 创建连接到签名器signer
      self.contract = c.connect(signer);
    },
    async onChange(e) {
      const file = e.target.files[0]
      this.fileName = file.name

      console.log(file, 'file');
      try {
        const added = await ipfs.add(file)
        console.log(added, '88')
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        this.fileUrl = url
      } catch (error) {
        console.log('error uploading file: ', error)
      }
    },
    async uploadFile(file) {
      // 上传文件
      console.log(file, 'file');
      this.fileName = file.name
      try {
        const added = await ipfs.add(file.raw)
        console.log(added, '88')
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        this.fileUrl = url
      } catch (error) {
        console.log('error uploading file: ', error)
      }
    },
    async onUploadInfo() {
      let self = this
      console.log('contract', self.contract)
      let info = {
        name: this.inputName,
        description: this.inputDesc,
        img: this.fileUrl,
        properties: {
          base: 'starfish',
          rich_property: {
            name: 'type',
            value: '3080',
            display_value: 'High'
          }
        },
        attributes: this.inputOther
        // attributes: [
        //   {
        //     trait_type: 'model',
        //     value: 'RTX3080',
        //   },
        //   {
        //     display_type: 'boost_number',
        //     trait_type: 'Power',
        //     value: 40
        //   },
        //   {
        //     display_type: 'number',
        //     trait_type: 'Gerneration',
        //     value: 2
        //   }
        // ]
      }
      let result = await ipfs.add(JSON.stringify(info))
      let url = `https://ipfs.infura.io/ipfs/${result.path}`
      console.log('upload', result)

      if (self.chainId == 4) {
        let r = await self.contract.mint([url]);
        let tx = await r.wait();
        console.log(tx);
      } else {
        alert("bad chain");
      }
    }
  },
  mounted() {
    // 进入页面连接钱包
    this.connect(); 
    console.log(ethers, 'ethers')
    let privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    let wallet = new ethers.Wallet(privateKey);
    console.log(wallet, 'wallet')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
  border: none;
  color: rgba(255, 255, 255, 0.6);
}
.colorful {
  padding: 30px 20%;
  color: #fff;
}
.flex {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
label {
  width: 150px;
  text-align: left;
  font-size: 10px;
}
.wrapper {
  padding: 18px 14px 13px 12.5px;
  background: #1F2024;
  box-shadow: inset 4px 4px 20px #000000, inset -4px -4px 20px rgba(99, 99, 99, 0.7);
  border-radius: 20px;
}
.wrapper p {
  font-size: 10px;
  margin-bottom: 17px;
  text-align: left;
  width: 250px;
  line-height: 22px;
  word-wrap: break-word;
  word-break: break-all;
}
.wrapper .no-img {
  width: 230px;
  height: 120px;
  color: 10px;
}
img {
  display: inline-block;
  width: 230px;
  height: 120px;
  border-radius: 5px;
}
.ipt-area >>> .el-input__inner, .ipt-area >>> .el-textarea__inner {
  background: #1F2024;
  box-shadow: -4px -4px 20px rgba(99, 99, 99, 0.31), 4px 4px 20px #000000;
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.6);
  border: none;
  font-size: 10px;
}
.el-button--primary {
  width: 100%;
  background: #E4002B;
  box-shadow: 2px 2px 10px #070002;
  border-radius: 30px;
  border: none;
  font-size: 10px;
}
.file-upload {
  height: 25px;
  width: 91px;
  background: rgb(228, 0, 43);
  box-shadow: rgb(7 0 2 / 85%) 4px 4px 20px;
  border-radius: 30px;
  border: none;
  color: #fff;
}
.upload-demo span {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
  display: inline-block;
}
</style>
