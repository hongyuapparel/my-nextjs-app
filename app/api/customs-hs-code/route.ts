import { NextRequest, NextResponse } from 'next/server'

// 服装HS编码数据库
const CLOTHING_HS_CODES = {
  // 棉制针织或钩编圆领T恤衫
  '6109100000': {
    hs_code: '6109100000',
    description: 'T-shirts, singlets and other vests, knitted or crocheted, of cotton',
    description_cn: '棉制针织或钩编圆领T恤衫',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '全棉/针织 T恤 背心 汗衫', required: true },
      { element: '成分含量', description: '适合男式 女式 男女同款', required: true },
      { element: '织造方法', description: '针织', required: true },
      { element: '种类', description: 'T恤衫、背心、汗衫', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男式纯棉T恤', '女式棉制圆领衫', '男女同款T恤', '运动T恤']
  },

  // 男士全棉短裤
  '6103420090': {
    hs_code: '6103420090',
    description: 'Men\'s or boys\' shorts of cotton, knitted or crocheted',
    description_cn: '棉制针织或钩编男式短裤',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '针织短裤', required: true },
      { element: '成分含量', description: '100%棉', required: true },
      { element: '织造方法', description: '针织', required: true },
      { element: '种类', description: '短裤', required: true },
      { element: '成人或儿童', description: '男式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男士全棉短裤', '棉制运动短裤', '针织休闲短裤']
  },

  // 涤棉手提袋
  '4202220000': {
    hs_code: '4202220000',
    description: 'Handbags with outer surface of textile materials',
    description_cn: '以纺织材料作面的手提包',
    category: '箱包',
    tariff_rate: {
      mfn_rate: '10%',
      general_rate: '50%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '手提袋', required: true },
      { element: '成分含量', description: '65%棉 35%涤纶', required: true },
      { element: '材质', description: '纺织材料', required: true },
      { element: '种类', description: '手提袋', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: [],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['涤棉手提袋', '帆布手提包', '纺织购物袋']
  },

  // 女士全棉运动裤
  '6204420000': {
    hs_code: '6204420000',
    description: 'Women\'s or girls\' trousers and shorts of cotton, not knitted',
    description_cn: '棉制女式梭织长裤',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '运动裤', required: true },
      { element: '成分含量', description: '100%棉', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '运动裤', required: true },
      { element: '成人或儿童', description: '女式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女士全棉运动裤', '女式梭织长裤', '棉制女装裤子']
  },

  // 女装梭织上衣
  '6211439000': {
    hs_code: '6211439000',
    description: 'Women\'s or girls\' garments of man-made fibres, not knitted',
    description_cn: '化纤制女式其他服装',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '梭织套装', required: true },
      { element: '成分含量', description: '100%涤纶', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '套装', required: true },
      { element: '成人或儿童', description: '女式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女装梭织上衣', '化纤制女式套装', '涤纶女装']
  },

  // 男士大衣
  '6101909000': {
    hs_code: '6101909000',
    description: 'Men\'s or boys\' overcoats, car-coats, capes, cloaks, anoraks of other materials',
    description_cn: '其他材料制男式针织大衣',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '男士大衣', required: true },
      { element: '成分含量', description: '各种纤维成分的含量', required: true },
      { element: '织造方法', description: '针织', required: true },
      { element: '种类', description: '大衣、外套', required: true },
      { element: '成人或儿童', description: '男式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男士大衣', '针织外套', '男式风衣']
  },

  // 卫裤（男式长裤）
  '6103430090': {
    hs_code: '6103430090',
    description: 'Men\'s or boys\' trousers of synthetic fibres, knitted or crocheted',
    description_cn: '合纤制针织或钩编男式长裤',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '针织长裤', required: true },
      { element: '成分含量', description: '85%棉，15%涤纶', required: true },
      { element: '织造方法', description: '针织', required: true },
      { element: '种类', description: '长裤', required: true },
      { element: '成人或儿童', description: '男式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['卫裤', '男式运动长裤', '针织休闲裤']
  },

  // 男士全棉毛衣
  '6103310000': {
    hs_code: '6103310000',
    description: 'Men\'s or boys\' jerseys, pullovers, cardigans, waistcoats of cotton, knitted',
    description_cn: '棉制针织或钩编男式毛衣',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '针织毛衣', required: true },
      { element: '成分含量', description: '36%粘胶纤维+64%涤纶', required: true },
      { element: '织造方法', description: '针织', required: true },
      { element: '种类', description: '毛衣', required: true },
      { element: '成人或儿童', description: '男式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男士全棉毛衣', '针织套头衫', '男式开衫']
  },

  // 棉制针织或钩编套头毛衫
  '6110200010': {
    hs_code: '6110200010',
    description: 'Cotton pullovers, cardigans and similar articles, knitted or crocheted',
    description_cn: '棉制针织或钩编套头毛衫',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '套头毛衫', required: true },
      { element: '成分含量', description: '棉制', required: true },
      { element: '织造方法', description: '针织或钩编', required: true },
      { element: '种类', description: '套头毛衫', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['棉制套头毛衫', '针织毛衣', '钩编开衫']
  },

  // 棉制针织或钩编圆领套头衫
  '6110200090': {
    hs_code: '6110200090',
    description: 'Other cotton pullovers, cardigans, waistcoats and similar articles, knitted',
    description_cn: '其他棉制针织或钩编圆领套头衫',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '圆领套头衫，开襟衫，马甲', required: true },
      { element: '成分含量', description: '棉制', required: true },
      { element: '织造方法', description: '针织或钩编', required: true },
      { element: '种类', description: '套头衫、开襟衫、马甲', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['圆领套头衫', '针织开襟衫', '棉制马甲（背心）']
  },

  // 棉制男式上衣
  '6203320000': {
    hs_code: '6203320000',
    description: 'Men\'s or boys\' jackets and blazers of cotton, not knitted',
    description_cn: '棉制男式梭织上衣',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '全棉/针织 男式上衣', required: true },
      { element: '成分含量', description: '全棉', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '上衣、夹克', required: true },
      { element: '成人或儿童', description: '男式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['棉制男式上衣', '男式梭织夹克', '全棉男装上衣']
  },

  // 棉制男式长裤、工装裤
  '6203429010': {
    hs_code: '6203429010',
    description: 'Men\'s or boys\' work trousers and bib and brace overalls of cotton',
    description_cn: '棉制男式长裤、工装裤',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '长裤、工装裤', required: true },
      { element: '成分含量', description: '棉制', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '长裤、工装裤', required: true },
      { element: '成人或儿童', description: '男式', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
         supervision_conditions: ['A: 入境货物通关单'],
     inspection_quarantine: ['M: 进口商品检验'],
     examples: ['棉制男式长裤', '工装裤', '男式休闲裤']
   },
   
   // 衬衫
  '6205200000': {
    hs_code: '6205200000',
    description: 'Men\'s or boys\' shirts of cotton, not knitted or crocheted',
    description_cn: '棉制男式衬衫，非针织或非钩编',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称', required: true },
      { element: '成分含量', description: '各种纤维成分的含量', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '衬衫的具体类型', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男士商务衬衫', '纯棉长袖衬衫', '免烫衬衫', '格子衬衫']
  },

  // 女式衬衫
  '6206400000': {
    hs_code: '6206400000',
    description: 'Women\'s or girls\' blouses, shirts and shirt-blouses of man-made fibres',
    description_cn: '化纤制女式衬衫',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称', required: true },
      { element: '成分含量', description: '各种纤维成分的含量', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '衬衫、女衫等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女士雪纺衫', '职业装衬衫', '化纤女衫', '休闲衬衫']
  },

  // 男士长裤
  '6203420000': {
    hs_code: '6203420000',
    description: 'Men\'s or boys\' trousers, bib and brace overalls, breeches and shorts of cotton',
    description_cn: '棉制男式长裤、护胸背带工装裤、马裤及短裤',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称', required: true },
      { element: '成分含量', description: '各种纤维成分的含量', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '长裤、短裤等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男士牛仔裤', '棉制休闲裤', '工装裤', '五分裤']
  },

  // 女士连衣裙
  '6204440000': {
    hs_code: '6204440000',
    description: 'Women\'s or girls\' dresses of artificial fibres',
    description_cn: '人造纤维制女式连衣裙',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称', required: true },
      { element: '成分含量', description: '各种纤维成分的含量', required: true },
      { element: '织造方法', description: '梭织或针织', required: true },
      { element: '种类', description: '连衣裙的具体类型', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女士晚礼服', '职业连衣裙', '休闲裙', '夏季连衣裙']
  },

  // 男式化纤外套
  '6201130000': {
    hs_code: '6201130000',
    description: 'Men\'s or boys\' overcoats, car-coats, capes, cloaks, anoraks of man-made fibres',
    description_cn: '化纤制男式大衣、风衣等',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如男式化纤风衣', required: true },
      { element: '成分含量', description: '各种纤维成分的含量，如100%聚酯纤维', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '大衣、夹克、风衣等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男士风衣', '化纤夹克', '防风外套', '商务大衣']
  },

  // 男式棉制外套
  '6201120000': {
    hs_code: '6201120000',
    description: 'Men\'s or boys\' overcoats, car-coats, capes, cloaks, anoraks of cotton',
    description_cn: '棉制男式大衣、风衣等',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如男式棉制夹克', required: true },
      { element: '成分含量', description: '各种纤维成分的含量，如100%棉', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '大衣、夹克、风衣等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['男式棉质夹克', '棉制休闲外套', '牛仔外套', '棉质大衣']
  },

  // 男式羊毛外套
  '6201110000': {
    hs_code: '6201110000',
    description: 'Men\'s or boys\' overcoats, car-coats, capes, cloaks, anoraks of wool or fine animal hair',
    description_cn: '毛制男式大衣、风衣等',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如男式羊毛大衣', required: true },
      { element: '成分含量', description: '各种纤维成分的含量，如100%羊毛', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '大衣、夹克、风衣等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['羊毛大衣', '羊绒外套', '毛呢夹克', '呢子大衣']
  },

  // 女式化纤外套
  '6202130000': {
    hs_code: '6202130000',
    description: 'Women\'s or girls\' overcoats, car-coats, capes, cloaks, anoraks of man-made fibres',
    description_cn: '化纤制女式大衣、风衣等',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如女式化纤风衣', required: true },
      { element: '成分含量', description: '各种纤维成分的含量，如100%聚酯纤维', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '大衣、夹克、风衣等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女士风衣', '化纤夹克', '防风外套', '时尚大衣']
  },

  // 女式棉制外套
  '6202120000': {
    hs_code: '6202120000',
    description: 'Women\'s or girls\' overcoats, car-coats, capes, cloaks, anoraks of cotton',
    description_cn: '棉制女式大衣、风衣等',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如女式棉制夹克', required: true },
      { element: '成分含量', description: '各种纤维成分的含量，如100%棉', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '大衣、夹克、风衣等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女式棉质夹克', '棉制休闲外套', '牛仔外套', '棉质大衣']
  },

  // 女式羊毛外套
  '6202110000': {
    hs_code: '6202110000',
    description: 'Women\'s or girls\' overcoats, car-coats, capes, cloaks, anoraks of wool or fine animal hair',
    description_cn: '毛制女式大衣、风衣等',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如女式羊毛大衣', required: true },
      { element: '成分含量', description: '各种纤维成分的含量，如100%羊毛', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '大衣、夹克、风衣等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false },
      { element: '货号', description: '商品型号', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女式羊毛大衣', '羊绒外套', '毛呢夹克', '呢子大衣']
  },

  // 男式羽绒服
  '6201900000': {
    hs_code: '6201900000',
    description: 'Men\'s or boys\' overcoats, car-coats, capes, cloaks, anoraks of other textile materials',
    description_cn: '其他纺织材料制男式大衣、风衣等（含羽绒服）',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如男式羽绒服', required: true },
      { element: '成分含量', description: '外层和内层纤维成分含量', required: true },
      { element: '填充物', description: '羽绒含量，如90%白鸭绒', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '羽绒服、防寒服等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验', 'N: 出口商品检验'],
    examples: ['男式羽绒服', '户外羽绒夹克', '防寒大衣', '保暖外套']
  },

  // 女式羽绒服
  '6202900000': {
    hs_code: '6202900000',
    description: 'Women\'s or girls\' overcoats, car-coats, capes, cloaks, anoraks of other textile materials',
    description_cn: '其他纺织材料制女式大衣、风衣等（含羽绒服）',
    category: '梭织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '13%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称，如女式羽绒服', required: true },
      { element: '成分含量', description: '外层和内层纤维成分含量', required: true },
      { element: '填充物', description: '羽绒含量，如90%白鸭绒', required: true },
      { element: '织造方法', description: '梭织', required: true },
      { element: '种类', description: '羽绒服、防寒服等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验', 'N: 出口商品检验'],
    examples: ['女式羽绒服', '户外羽绒夹克', '防寒大衣', '保暖外套']
  },

  // 内衣内裤
  '6108220000': {
    hs_code: '6108220000',
    description: 'Women\'s or girls\' briefs and panties of man-made fibres, knitted or crocheted',
    description_cn: '化纤制针织或钩编女式内裤',
    category: '针织服装',
    tariff_rate: {
      mfn_rate: '17.5%',
      general_rate: '130%',
      vat_rate: '13%',
      consumption_tax: '0%'
    },
    declaration_elements: [
      { element: '品名', description: '具体商品名称', required: true },
      { element: '成分含量', description: '各种纤维成分的含量', required: true },
      { element: '织造方法', description: '针织或钩编', required: true },
      { element: '种类', description: '内裤、三角裤等', required: true },
      { element: '成人或儿童', description: '适用人群', required: true },
      { element: '品牌', description: '商品品牌', required: false }
    ],
    supervision_conditions: ['A: 入境货物通关单'],
    inspection_quarantine: ['M: 进口商品检验'],
    examples: ['女式内裤', '无痕内裤', '三角裤', '舒适内裤']
  }
}

// 搜索关键词映射
const SEARCH_KEYWORDS = {
  // T恤相关
  't恤': ['6109100000'],
  'T恤': ['6109100000'],
  't-shirt': ['6109100000'],
  '汗衫': ['6109100000'],
  '背心': ['6109100000', '6110200090'],
  '圆领T恤': ['6109100000'],
  
  // 衬衫
  '衬衫': ['6205200000', '6206400000'],
  'shirt': ['6205200000', '6206400000'],
  '男式衬衫': ['6205200000'],
  '女式衬衫': ['6206400000'],
  
  // 裤子相关
  '裤子': ['6203420000', '6103420090', '6103430090', '6204420000', '6203429010'],
  '长裤': ['6203420000', '6103430090', '6204420000', '6203429010'],
  '短裤': ['6103420090'],
  'pants': ['6203420000', '6103420090', '6103430090', '6204420000'],
  'trousers': ['6203420000', '6103430090', '6204420000'],
  '运动裤': ['6204420000', '6103430090'],
  '工装裤': ['6203429010'],
  '卫裤': ['6103430090'],
  '男式长裤': ['6103430090', '6203429010'],
  '女式长裤': ['6204420000'],
  
  // 连衣裙
  '连衣裙': ['6204440000'],
  'dress': ['6204440000'],
  '裙子': ['6204440000'],
  
  // 外套相关（包含所有成分和性别）
  '外套': ['6201130000', '6201120000', '6201110000', '6202130000', '6202120000', '6202110000', '6201900000', '6202900000', '6101909000'],
  '夹克': ['6201130000', '6201120000', '6201110000', '6202130000', '6202120000', '6202110000'],
  '大衣': ['6201130000', '6201120000', '6201110000', '6202130000', '6202120000', '6202110000', '6101909000'],
  '风衣': ['6201130000', '6201120000', '6202130000', '6202120000'],
  '羽绒服': ['6201900000', '6202900000'],
  'jacket': ['6201130000', '6201120000', '6201110000', '6202130000', '6202120000', '6202110000'],
  'coat': ['6201130000', '6201120000', '6201110000', '6202130000', '6202120000', '6202110000', '6101909000'],
  '男士大衣': ['6101909000'],
  
  // 毛衣相关
  '毛衣': ['6103310000', '6110200010', '6110200090'],
  '套头衫': ['6110200010', '6110200090'],
  '套头毛衫': ['6110200010'],
  '开襟衫': ['6110200090'],
  '马甲': ['6110200090'],
  
  // 上衣相关
  '上衣': ['6203320000', '6211439000'],
  '男式上衣': ['6203320000'],
  '女式上衣': ['6211439000'],
  '套装': ['6211439000'],
  
  // 箱包
  '手提袋': ['4202220000'],
  '手提包': ['4202220000'],
  '购物袋': ['4202220000'],
  
  // 按性别分类
  '男装': ['6103420090', '6103430090', '6103310000', '6203320000', '6203429010', '6101909000'],
  '女装': ['6204420000', '6211439000'],
  '男式': ['6103420090', '6103430090', '6103310000', '6203320000', '6203429010', '6101909000'],
  '女式': ['6204420000', '6211439000'],
  
  // 按成分分类
  '棉制': ['6109100000', '6103420090', '6204420000', '6103310000', '6110200010', '6110200090', '6203320000', '6203429010'],
  '全棉': ['6109100000', '6103420090', '6204420000', '6103310000', '6110200010', '6110200090', '6203320000', '6203429010'],
  '化纤': ['6103430090', '6211439000'],
  '涤纶': ['6211439000'],
  '合纤': ['6103430090'],
  '涤棉': ['4202220000'],
  '粘胶': ['6103310000'],
  
  // 按织造方法
  '针织': ['6109100000', '6103420090', '6103430090', '6103310000', '6110200010', '6110200090', '6101909000'],
  '梭织': ['6204420000', '6211439000', '6203320000', '6203429010'],
  '钩编': ['6109100000', '6103420090', '6103430090', '6103310000', '6110200010', '6110200090']
}

// 产品搜索函数
function searchProduct(query: string) {
  const results: any[] = []
  const queryLower = query.toLowerCase()
  
  // 直接匹配HS编码
  if (CLOTHING_HS_CODES[query as keyof typeof CLOTHING_HS_CODES]) {
    results.push(CLOTHING_HS_CODES[query as keyof typeof CLOTHING_HS_CODES])
    return results
  }
  
  // 关键词搜索
  const matchedCodes = new Set<string>()
  
  for (const [keyword, codes] of Object.entries(SEARCH_KEYWORDS)) {
    if (queryLower.includes(keyword.toLowerCase())) {
      codes.forEach(code => matchedCodes.add(code))
    }
  }
  
  // 描述搜索
  for (const [code, data] of Object.entries(CLOTHING_HS_CODES)) {
    if (
      data.description_cn.toLowerCase().includes(queryLower) ||
      data.description.toLowerCase().includes(queryLower) ||
      data.examples.some(example => example.toLowerCase().includes(queryLower))
    ) {
      matchedCodes.add(code)
    }
  }
  
  // 转换为结果数组
  matchedCodes.forEach(code => {
    if (CLOTHING_HS_CODES[code as keyof typeof CLOTHING_HS_CODES]) {
      results.push(CLOTHING_HS_CODES[code as keyof typeof CLOTHING_HS_CODES])
    }
  })
  
  return results.slice(0, 10) // 限制返回数量
}

// HS编码查询函数
function lookupHsCode(hsCode: string) {
  const normalizedCode = hsCode.replace(/\D/g, '') // 移除非数字字符
  
  // 精确匹配
  if (CLOTHING_HS_CODES[normalizedCode as keyof typeof CLOTHING_HS_CODES]) {
    return CLOTHING_HS_CODES[normalizedCode as keyof typeof CLOTHING_HS_CODES]
  }
  
  // 前缀匹配
  for (const [code, data] of Object.entries(CLOTHING_HS_CODES)) {
    if (code.startsWith(normalizedCode) || normalizedCode.startsWith(code.substring(0, 6))) {
      return data
    }
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, query, hs_code } = body

    if (type === 'search_product') {
      if (!query) {
        return NextResponse.json({ 
          success: false, 
          error: '请提供产品名称或描述' 
        }, { status: 400 })
      }

      const results = searchProduct(query)
      
      if (results.length === 0) {
        return NextResponse.json({
          success: false,
          error: '未找到匹配的HS编码，请尝试其他关键词'
        })
      }

      return NextResponse.json({
        success: true,
        results,
        message: `找到 ${results.length} 个相关编码`
      })
    }

    if (type === 'lookup_hs_code') {
      if (!hs_code) {
        return NextResponse.json({ 
          success: false, 
          error: '请提供HS编码' 
        }, { status: 400 })
      }

      const result = lookupHsCode(hs_code)
      
      if (!result) {
        return NextResponse.json({
          success: false,
          error: '未找到该HS编码的信息'
        })
      }

      return NextResponse.json({
        success: true,
        result,
        message: 'HS编码查询成功'
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: '不支持的请求类型' 
    }, { status: 400 })

  } catch (error) {
    console.error('海关编码API错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误' 
    }, { status: 500 })
  }
} 