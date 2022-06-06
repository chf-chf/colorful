<template>
  <div class="colorful">
    <div class="logo" style="text-align:left; margin-bottom: 20px; display: flex;">
      <img src="../assets/logo-colorful.png" />
    </div>
    <div class="wallet-info">
      <div>
          <div v-if="address">
            钱包地址：{{address.replace(/(.{6}).*(.{4})/, '$1...$2')}}
            <span style="cursor: pointer;" @click="whitelistSetting" v-if="isAdmin">管理白名单</span>
            <span :class="{'notWhitelist': !isWhiteList}" v-else-if="!isWhiteList">
                非白名单
            </span>
          </div>
          <div v-else>
              <el-button class="connect-btn" @click="connect" round>连接钱包</el-button>
          </div>
      </div>
    </div>
    <div class="flex">
      <div class="left">
        <div class="flex">
          <label>产品名称</label>
          <el-input class="ipt-area" v-model="inputName" placeholder="请输入内容"></el-input>

        </div>
        <div class="flex">
          <label>产品介绍</label>
          <el-input class="ipt-area" v-model="inputDesc" type="textarea" rows="4" placeholder="请输入内容"></el-input>

        </div>
        <div class="flex another">
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
        <div class="flex another">
          <label>上市时间</label>
          <el-date-picker class="ipt-area" v-model="inputDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择"></el-date-picker>
          <!-- <el-input class="ipt-area" v-model="inputDate" placeholder="请输入内容"></el-input> -->

        </div>
        <div class="flex another">
            <label>boost参数</label>
            <div style="display: flex;">
                <el-input class="ipt-area ipt-area-other" v-model="boostKey" placeholder="请输入key:"></el-input>
                <el-input class="ipt-area ipt-area-other" v-model="boostVal" type="number" placeholder="请输入value:"></el-input>
            </div>
        </div>
        <div class="flex another">
          <label>其他参数</label>
          <div>
            <div style="margin-bottom: 15px" v-for="(item, index) in attr" :key="index">
                <div style="display: flex;">
                    <el-input class="ipt-area ipt-area-other" v-model="item.trait_type" placeholder="请输入key:"></el-input>
                    <el-input class="ipt-area ipt-area-other" v-model="item.value" placeholder="请输入value:"></el-input>
                    <!-- <el-button v-show="attr.length > 1" type="primary" style="width: 80px; height: 40px;" round @click="addParams">删除</el-button> -->
                </div>
            </div>
          </div>
          
          <el-button type="primary" style="width: 80px; height: 40px;" round @click="addParams">添加</el-button>
        </div>
        
        <div class="flex">
          <label />
          <el-button type="primary" round @click="onUploadInfo">上传产品</el-button>
        </div>
      </div>
      <div class="right">
        <div class="wrapper">
          <div v-show="fileUrl">
                <el-image v-if="isImg" :src="fileUrl">
                    <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                    </div>
                </el-image>
                <video v-else controls :src="fileUrl"></video>

          </div>
          <div v-show="!fileUrl" class="no-img">暂无显示</div>
          <div style="padding-left: 7px;">
            <p>产品名称：{{inputName}}</p>
            <p>产品故事：{{inputDesc}}</p>
            <p>上市时间：{{inputDate}}</p>
            <!-- <p>产品参数：{{inputOther}}</p> -->
          </div>
        </div>
        <div v-if="tx" style="margin-left: 100px; margin-top: 20px;">
            <p>
                <el-link :href="chainId === 4 ? `https://rinkeby.etherscan.io/tx/${tx.transactionHash}` : `https://etherscan.io/tx/${transactionHash}`" target="blank">查看-etherscan</el-link>
            </p>
            <p>
                <el-link :href="chainId === 4 ? 'https://testnets.opensea.io/account' : 'https://opensea.io/account'" target="_blank">
                    查看-opensea
                </el-link>
            </p>
        </div>
      </div>
    </div>
    <el-dialog
    title="提示"
    :visible.sync="dialogVisible"
    width="40%">
    <el-input v-model="whiteAddr" placeholder="请输入白名单地址"></el-input>
    <div class="switch-btn">
        <span>是否添加到白名单</span>
        <el-switch v-model="isAdd" active-color="#409EFF" inactive-color="#C0CCDA"></el-switch>
    </div>
    <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="handleClose">确定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
import { create } from 'ipfs-http-client'
import {ethers} from 'ethers'
import abi from '../../abi.json'
import config from '../../config'

const ipfs = create('https://ipfs.infura.io:5001/api/v0')

// 合约地址
// const contractAddress = "0x3b202c891F0386ef1E54f6334f60afE8f3C15c5c";

export default {
  name: 'ColorfulPage',
  props: {
    msg: String
  },
  data() {
    return {
      web3: null,
      chainId: null,
      address: '',
      fileUrl: '',
      imgHash: '',
      inputName: '',
      inputDesc: '',
      inputDate: '',
      inputOther: '',
      fileName: '',
      tx: null,
      isAdmin: false,
      isWhiteList: false,
      isAdd: true,
      whiteAddr: '',
      dialogVisible: false,
      isImg: null,
      attr: [],
      boostKey: '',
      boostVal: null
    }
  },
  methods: {
    async change_chain() { 
      window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: config.chainId }],
        })
        .then(() => {
            // window.location.reload();
            this.connect()
        })
        .catch((error) => {
            console.log('error chain', error)
        });
    },
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

      // 创建provider
      web3 = new ethers.providers.Web3Provider(web3Provider);

      // 获取当前钱包账户
    //   const accounts = await web3.send('eth_requestAccounts', [])
    //   console.log(accounts, '===accounts===')
    //   let myAccountAddr = accounts[0]

      // 获取账户余额
    //   let balance = ethers.utils.formatEther(await web3.getBalance(myAccountAddr))
    //   console.log(balance, '===balance===')

      let user = web3.getSigner();
      //ether.js获取chainId等链信息比web3.js简洁且有逻辑的多,直接通过getNetWork即可获得链内容
      let networkInfo = await web3.getNetwork();
      // ethers.js和web3.js不同的点,在于可以直接获得当前钱包地址,通过上面的Signer(user)
      let wallet_address = await user.getAddress();
      console.log(wallet_address, 'wallet_address') // 等同于myAccountAddr
      console.log(web3, 'web3')

      // 哪个以太坊网络ID：主网mainnet：1，rinkeby:4，kovan:43等等
      // https://learnblockchain.cn/article/1791
      let chainId = networkInfo.chainId

      self.web3 = web3;
      self.chainId = chainId;
      self.address = wallet_address;
      window.ethereum.on("chainChanged", chainId => {
        console.log("用户切换了链", chainId);
      });
        // 连接合约
        let c = await new ethers.Contract(config.contractAddress, abi, self.web3);
        let signer = self.web3.getSigner();
        console.log(signer, 'signer')

        // 创建连接到签名器signer
        self.contract = c.connect(signer);

        // 判断是否为合约管理员
        let adminAddr = await self.contract.owner()
        self.isAdmin = adminAddr == wallet_address
        // self.isAdmin = true
        console.log(self.isAdmin, 'isadmin')

        // 判断创建NFT作者是否在白名单内
        self.isWhiteList = await self.contract.isWhiteList(wallet_address)
        // self.isWhiteList = false
        console.log(self.isWhiteList, 'isWhiteList')


    },
    // async onChange(e) {
    //   const file = e.target.files[0]
    //   this.fileName = file.name

    //   console.log(file, 'file');
    //   try {
    //     const added = await ipfs.add(file)
    //     console.log(added, '88')
    //     const url = `https://ipfs.infura.io/ipfs/${added.path}`
    //     this.fileUrl = url
    //   } catch (error) {
    //     console.log('error uploading file: ', error)
    //   }
    // },
    async uploadFile(file) {
      // 上传文件
      console.log(file, 'file');
      let {raw: {type}, name, size} = file

      let isLt10M = size / 1024 /1024 < 10
     
      if (!isLt10M) {
          this.$message.error('上传的文件大小不能超过 10MB!');
          return;
      }
      this.fileName = name
      this.isImg = type.includes('image')
      const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      try {
        const added = await ipfs.add(file.raw)
        console.log(added, '88')
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        loading.close()
        this.fileUrl = url
        this.imgHash = added.path
      } catch (error) {
        loading.close()
        console.log('error uploading file: ', error)
      }
    },
    async onUploadInfo() {
      let self = this
      console.log(this.inputDate, 'attr99')

      console.log('contract', self.contract)
      if (!this.inputName) {
          self.$message.error('产品名称不能为空！')
          return;
      }

      if (!this.inputDesc) {
          self.$message.error('产品介绍不能为空！')
          return;
      }
      if (!this.fileUrl) {
          self.$message.error('图片不能为空！')
          return;
      }
      if (!this.inputDate) {
          self.$message.error('上市时间不能为空！')
          return;
      }

      for(let i = 0; i < this.attr.length; i++) {
          if (!this.attr[i].trait_type || !this.attr[i].value) {
              self.$message.error('其他参数不能为空')
              return;
          }
      }

      let info = {
        name: this.inputName,
        description: this.inputDesc,
        image: `ipfs://${this.imgHash}`,
        attributes: this.attr.concat({
            display_type: 'date',
            trait_type: 'Setup Time',
            value: +new Date(this.inputDate)
        }).concat({
            display_type: 'boost_number',
            trait_type: this.boostKey,
            value: this.boostVal
        }),
        // properties: {
        //   base: 'starfish',
        //   rich_property: {
        //     name: 'type',
        //     value: '3080',
        //     display_value: 'High'
        //   }
        // },
        // attributes: this.inputOther
        // attributes: [
        //   {
        //     trait_type: 'Chip_Group',
        //     value: 'Intel Z690',
        //   },
        //   {
        //     // display_type: 'boost_number',
        //     trait_type: 'Graphics_Card',
        //     value: 'PCI Express '
        //   },
        //   {
        //     // display_type: 'number',
        //     trait_type: 'Model_Type',
        //     value: 'CVN Z690D5'
        //   },
        //   {
        //     display_type: 'date',
        //     trait_type: 'Setup Time',
        //     value: +new Date()
        //   }
        // ]
      }
      console.log('minting...', info);
        const nftLoading = this.$loading({
            lock: true,
            text: '上传中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
        });
      let result = await ipfs.add(JSON.stringify(info))
    //   let url = `https://ipfs.infura.io/ipfs/${result.path}`
      let url = `ipfs://${result.path}`
      console.log('upload', result, url)

      if (self.chainId == parseInt(config.chainId)) {
        
        try {
          
          let r = await self.contract.mintNFT([url]);
          let tx = await r.wait();
          self.tx = tx
          nftLoading.close()
          self.$message({
              message: '上传成功了',
              type: 'success'
          })
          console.log(tx, 'done');
        } catch (error) {
          nftLoading.close()
          self.$message.error('非白名单添加失败')  
          console.log('error mintNFT', error);
        }

      } else {
        alert("bad chain");
      }
    },
    addParams() {
        console.log(this.attr, 'add')
        this.attr.push(Object.assign({
            trait_type: '',
            value: ''
        }))
    },
    whitelistSetting() {
        this.dialogVisible = true
        // this.$router.push({name: 'WhitelistPage'}).catch(err => err)
        // self.$prompt('请输入白名单地址', '提示', {
        //     confirmButtonText: '确认',
        //     cancelButtonText: '取消'
        // }).then(async ({value}) => {
        //     let whitelist = await self.contract.setWhiteList(value, true)
        //     console.log(whitelist, 'val000')
        // }).catch(() => {
        //     console.log('888');
        // })
    },
    async handleClose() {
        let self = this;
        if (!self.whiteAddr) {
            self.$message.error('输入内容不能为空！')
            return;
        }
        try {
            let whitelist = await self.contract.setWhiteList(self.whiteAddr, self.isAdd)
            self.dialogVisible = false
            self.whiteAddr = ''
            console.log(whitelist, 'whitelist')
        } catch (error) {
            console.log(error, 'error')
            self.$message.error('添加白名单失败')
            self.dialogVisible = false
            self.whiteAddr = ''
        }

    }
  },
  mounted() {
    this.attr.push({
        trait_type: '',
        value: ''
    })
    // 进入页面连接钱包
    this.connect();
    this.change_chain() 
    // console.log(ethers, 'ethers')
    // let privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    // let wallet = new ethers.Wallet(privateKey);
    // console.log(wallet, 'wallet')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
  border: none;
  color: rgba(255, 255, 255, 0.6);
}
label {
  width: 130px;
  text-align: left;
}
img {
  display: inline-block;
  /* width: 230px;
  height: 120px; */
  width: 100%;
  height: 100%;
  border-radius: 5px;
}
video {
    width: 100%;
    height: 100%;
}
.colorful {
  /* padding: 30px 18%; */
  width: 1000px;
  margin: 0 auto;
  color: #fff;
  font-weight: 700;
  font-family: Arial, Helvetica, sans-serif;
}
.logo {
    text-align: left;
    margin-bottom: 20px;
    display: flex;
}
.logo img {
    width: 400px;
    height: 100%;
}
.wallet-info {
    text-align: right;
    margin-bottom: 20px;
}
.flex {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.flex.another {
  justify-content: left;
}
.wrapper {
  padding: 18px 14px 13px 12.5px;
  margin-left: 100px;
  background: #1F2024;
  box-shadow: inset 4px 4px 20px #000000, inset -4px -4px 20px rgba(99, 99, 99, 0.7);
  border-radius: 20px;
}
.wrapper p {
  margin-bottom: 17px;
  text-align: left;
  width: 250px;
  line-height: 22px;
  word-wrap: break-word;
  word-break: break-all;
}
.wrapper .no-img {
  /* width: 230px;
  height: 120px; */
  margin-bottom: 50px;
}
.ipt-area {
    width: 460px;
}
.ipt-area-other {
    width: 180px;
    margin-right: 10px;
}
.ipt-area >>> .el-input__inner, .ipt-area >>> .el-textarea__inner {
  background: #1F2024;
  box-shadow: -4px -4px 20px rgba(99, 99, 99, 0.31), 4px 4px 20px #000000;
  border-radius: 5px;
  color: rgba(255, 255, 255, 0.6);
  border: none;
}
.el-button--primary {
  width: 460px;
  background: #E4002B;
  box-shadow: 2px 2px 10px #070002;
  border-radius: 30px;
  border: none;
}
.connect-btn.el-button {
    border: 1px solid rgb(99 99 99 / 31%);
    background-color: #1F2024;
    color: #fff;
    box-shadow: -4px -4px 20px rgb(99 99 99 / 31%), 4px 4px 20px #000000;
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
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
  display: inline-block;
}
.notWhitelist {
    color: #E4002B;
}
.el-link.el-link--default {
    color: #fff;
    font-size: 20px;
}
.switch-btn {
    display: flex;
    align-items: center;
    margin-top: 20px;
}
.switch-btn span {
    margin-right: 10px;
}
</style>
