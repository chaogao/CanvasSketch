/* Copyright (c) 2000-2011 by SuperMap Software Co., Ltd.*/

/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/BaseTypes/Bounds.js
 * @requires SuperMap/CanvasLayer.js
 */

/**
 * Class: SuperMap.Layer.TDTLayer
 * 天地图图层类。
 *     通过向天地图服务器发送请求得到天地图的图层。
 *
 * Inherits from:
 *  - <SuperMap.CanvasLayer>
 */

SuperMap.Layer.TDTLayer = SuperMap.Class(SuperMap.CanvasLayer, {

    /**
     * Property: name
     * {String} 图层标识名称。
     */
    name: "TDTLayer",
    
    /**
     * Property: url
     * {String} 图层的服务地址。
     */
    url: null,
    
    /**
     * Property: isMarks
     * {Boolean} 是否为文字图层。
     */
    isMarks: false,
    
    //定义基本URL
    subDomains : [ "0", "1", "2", "3", "4", "5" ],
    //道路图层缩放级别2-10的URL
    VectorGroup1 :"http://tile${d}.tianditu.com/DataServer?T=A0512_EMap&X=${x}&Y=${y}&L=${l}",
    //道路图层缩放级别11-13的URL
    VectorGroup2 : "http://tile${d}.tianditu.com/DataServer?T=B0627_EMap1112&X=${x}&Y=${y}&L=${l}",
    //道路图层缩放级别13以上的URL
    VectorGroup3 : "http://tile${d}.tianditu.com/DataServer?T=siwei0608&X=${x}&Y=${y}&L=${l}",

    //影像图层缩放级别2-10的URL
     AerialGroup1 : "http://tile${d}.tianditu.com/DataServer?T=sbsm0210&X=${x}&Y=${y}&L=${l}",
    //影像图层缩放级别11的URL
    AerialGroupLeve11 : "http://tile${d}.tianditu.com/DataServer?T=e11&X=${x}&Y=${y}&L=${l}",
    //影像图层缩放级别12的URL
    AerialGroupLeve12 : "http://tile${d}.tianditu.com/DataServer?T=e12&X=${x}&Y=${y}&L=${l}",
    //影像图层缩放级别13的URL
    AerialGroupLeve13 : "http://tile${d}.tianditu.com/DataServer?T=e13&X=${x}&Y=${y}&L=${l}",
    //影像图层缩放级别14的URL
    AerialGroupLeve14 : "http://tile${d}.tianditu.com/DataServer?T=eastdawnall&X=${x}&Y=${y}&L=${l}",
    //影像图层缩放级别15以上的URL
    AerialGroupLeve15 : "http://tile${d}.tianditu.com/DataServer?T=sbsm1518&X=${x}&Y=${y}&L=${l}",

    //影像图层缩放级别2-10地图标记文字的URL
    AerialMarksGroup1 : "http://tile${d}.tianditu.com/DataServer?T=A0610_ImgAnno&X=${x}&Y=${y}&L=${l}",
    //影像图层缩放级别11-13地图标记文字的URL
    AerialMarksGroup2 : "http://tile${d}.tianditu.com/DataServer?T=B0530_eImgAnno&X=${x}&Y=${y}&L=${l}",
    //影像图层缩放级别13以上地图标记文字的URL
    AerialMarksGroup3 : "http://tile${d}.tianditu.com/DataServer?T=siweiAnno68&X=${x}&Y=${y}&L=${l}",
    //道路图层缩放级别2-10地图标记文字的URL
    VectorMarks : "http://tile${d}.tianditu.com/DataServer?T=AB0512_Anno&X=${x}&Y=${y}&L=${l}",     
    /**
     * Constructor: SuperMap.Layer.TDTLayer
     * 云服务图层类。
     *
     * Parameters:
     * options - {Object}  附加到图层属性上的可选项。
     */
    initialize: function (options) {
        
        var me = this;
       
        options = SuperMap.Util.extend({
            maxExtent: new SuperMap.Bounds(
                -179.99999999999997,
                -90.0,
                180.00000000000023,
                89.99999999999994
            ),
            resolutions: [0.35156249999999994,0.17578124999999997,0.08789062500000014,0.04394531250000007,
                          0.021972656250000007,0.01098632812500002,0.00549316406250001,0.0027465820312500017,
                          0.0013732910156250009,0.000686645507812499,0.0003433227539062495,0.00017166137695312503,
                          0.00008583068847656251,0.000042915344238281406,0.000021457672119140645,0.000010728836059570307,
                          0.000005364418029785169]
        }, options);
        
        SuperMap.CanvasLayer.prototype.initialize.apply(me, [me.name, me.url, null, options]);
    },
    
    /**
     * APIMethod: destroy
     * 解构TDTLayer类，释放资源。  
     */
    destroy: function () {
        var me = this;
        SuperMap.CanvasLayer.prototype.destroy.apply(me, arguments);
        me.name = null;
        me.url = null;
    },

    /**
     * APIMethod: clone
     * 创建当前图层的副本。
     *
     * Parameters:
     * obj - {Object} 
     *
     * Returns:
     * {<SuperMap.Layer.TDTLayer>} 
     */
    clone: function (obj) {
        var me = this;
        if (obj == null) {
            obj = new SuperMap.Layer.TDTLayer(
                me.name, me.url, me.getOptions());
        }
       
        obj = SuperMap.CanvasLayer.prototype.clone.apply(me, [obj]);

        return obj;
    },
    
    getLevelForResolution: function (res) { 
        var me = this;
        for (var i=0,len=me.resolutions.length;i<len;i++) {
            if (me.resolutions[i] ===res) {
                return i;
            }
        }
    },

    /** 
     * Method: getTileUrl
     * 获取瓦片的URL。
     *
     * Parameters:
     * xyz - {Object} 一组键值对，表示瓦片X, Y, Z方向上的索引。
     *
     * Returns
     * {String} 瓦片的 URL。
     */
    getTileUrl: function (xyz) {
        var me = this,
            tileSize = new SuperMap.Size(256,256),
            url = me.url;
            
        var level = me.getLevelForResolution(me.map.getResolution()); 
        
      
        level += 2;
        switch (me.Mode)
        {
            case SuperMap.REST.TDTLayerType.Vector:

                if (level >= 13 && level <= 18)
                {
                    me.url = me.VectorGroup3;
                }
                if (level >= 11 && level <= 12)
                {
                    me.url = me.VectorGroup2;
                }
                if (level >= 2 && level <= 10)
                {
                    if (me.isMarks)
                    {
                        me.url = me.VectorMarks;
                    }
                    else
                    {
                        me.url = me.VectorGroup1;
                    }
                    break;
                }
                break;
            case SuperMap.REST.TDTLayerType.Aerial:
                if (level >= 2 && level <= 10)
                {
                    if (me.isMarks)
                    {
                        me.url = me.AerialMarksGroup1;
                    }
                    else
                    {
                        me.url = me.AerialGroup1;
                    }
                }

                if (level == 11)
                {
                    if (me.isMarks)
                    {
                        me.url = me.AerialMarksGroup2;
                    }
                    else
                    {
                        me.url = me.AerialGroupLeve11;
                    }
                }
                if (level == 12)
                {
                    if (me.isMarks)
                    {
                        me.url = me.AerialMarksGroup2;
                    }
                    else
                    {
                        me.url = me.AerialGroupLeve12;
                    }
                }
                if (level == 13)
                {
                    if (me.isMarks)
                    {
                        me.url = me.AerialMarksGroup2;
                    }
                    else
                    {
                        me.url = me.AerialGroupLeve13;
                    }
                }
                if (level == 14)
                {
                    if (me.isMarks)
                    {
                        me.url = me.AerialMarksGroup2;
                    }
                    else
                    {
                        me.url = me.AerialGroupLeve14;
                    }
                }
                if (level >= 15)
                {
                    if (me.isMarks)
                    {
                        me.url = me.AerialMarksGroup3;
                    }
                    else
                    {
                        me.url = me.AerialGroupLeve15;
                    }
                }
                break;
        }
        
        return SuperMap.String.format(me.url, {
            d: 1,
            x: xyz.x,
            y: xyz.y,
            l: level
        });
    }, 
    
    CLASS_NAME: "SuperMap.Layer.TDTLayer"
});