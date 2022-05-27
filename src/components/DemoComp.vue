<template>
    <div class="demo">

        <p>colorful x nplus</p>
        <div class="info-area">
            <div class="info-input">
                <el-form ref="form" :model="form" label-position="left" label-width="130px">
                    <el-form-item label="产品名称">
                        <el-input class="ipt-area" v-model="form.name" placeholder="请输入内容"></el-input>
                    </el-form-item>
                    <el-form-item label="产品故事">
                        <el-input class="ipt-area" type="textarea" v-model="form.desc" placeholder="请输入内容"></el-input>
                    </el-form-item>
                    <el-form-item label="产品图片/video">
                        <el-upload
                            class="upload-demo"
                            action="https://ipfs.infura.io/ipfs/"
                            :on-change="uploadFile">
                            <button class="file-upload" style="height: 25px; width: 91px; background: #E4002B;box-shadow: 4px 4px 20px rgba(7, 0, 2, 0.85);border-radius: 60px;">选择文件</button>
                            <span>{{fileName ? fileName : "未选择任何文件"}}</span>
                        </el-upload>
                        <!-- <el-input v-model="form.fileUrl" placeholder="请输入内容"></el-input> -->
                    </el-form-item>
                    <el-form-item label="上市时间">
                        <el-input class="ipt-area" v-model="form.date" placeholder="请输入内容"></el-input>
                    </el-form-item>
                    <el-form-item label="其他参数">
                        <el-input class="ipt-area" type="textarea" v-model="form.properties" placeholder="请输入内容"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" round @click="onUploadInfo">上传产品</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="info-detail">
                <div class="detail-box">
                    <div v-show="form.fileUrl">
                        <img :src="form.fileUrl" />
                    </div>
                    <div v-show="!form.fileUrl" style="width:230px;height:120px">暂无图片</div>
                    <p>产品名称：{{form.name}}</p>
                    <p>产品故事：{{form.desc}}</p>
                    <p>上市时间：{{form.date}}</p>
                    <p>产品参数：{{form.properties}}</p>
                </div>
            </div>
         </div>
    </div>
</template>

<script>
    import { create } from 'ipfs-http-client'
    const ipfs = create('https://ipfs.infura.io:5001/api/v0')
    export default {
        name: 'DemoComp',
        data() {
            return {
                form: {
                    name: '',
                    desc: '',
                    fileUrl: '',
                    date: '',
                    properties: ''
                },
                fileName: ''
            }
        },
        methods: {
            async uploadFile(file) {
                console.log(file, 'file');
                this.fileName = file.name
                try {
                    const added = await ipfs.add(file.raw)
                    console.log(added, '88')
                    const url = `https://ipfs.infura.io/ipfs/${added.path}`
                    this.form['fileUrl'] = url
                } catch (error) {
                    console.log('error uploading file: ', error)
                }
            },
            async onUploadInfo() {
                let info = {
                    name: this.form.name,
                    description: this.form.desc,
                    img: this.form.fileUrl,
                    properties: {
                    base: 'starfish',
                    rich_property: {
                        name: 'type',
                        value: '3080',
                        display_value: 'High'
                    }
                    },
                    attributes: this.form.properties
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
                console.log('upload', `https://ipfs.infura.io/ipfs/${result.path}`)
            }
        }
    }
</script>

<style scoped>
    .demo {
        width: 90%;
        margin: 40px auto;
        color: #fff;
    }
    .info-area {
        display: flex;
        justify-content: space-between;
    }
    .upload-demo {
        text-align: left;
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
    /* 修改输入框默认样式 */
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
        /* height: 25px; */
        background: #E4002B;
        box-shadow: 2px 2px 10px #070002;
        border-radius: 30px;
        border: none;
        /* line-height: 25px; */
        font-size: 10px;
    }
    .detail-box {
        padding: 18px 14px 13px 12.5px;
        background: #1F2024;
        box-shadow: inset 4px 4px 20px #000000, inset -4px -4px 20px rgb(99 99 99 / 70%);
        border-radius: 20px;
    }
</style>