$(function(){
    $(".language_item").hover(
        function(){
            $(this).css("box-shadow", "10px 10px 30px #000000")
        },
        function(){
            $(this).css("box-shadow", "10px 10px 20px #AAAAAA")
        }
    );

    $(".language_item").on("click", function(){
        location.href = $(this).find("a").attr("href")
    })

    $(".list").hover(
        function(){
            $(this).css("color", "#00FFFF");

        },
        function(){
            $(this).css("color", "#ffffff");

        }
    )

    $(".article").hover(
        function(){
            $(this).css("box-shadow", "10px 10px 30px #000000")
        },
        function(){
            $(this).css("box-shadow", "10px 10px 20px #AAAAAA")
        }
    )

    $(".article").on("click", function(){
        location.href = $(this).find(".detail_btn").attr("href")
    })

    $(".post_btn").hover(
        function(){
            $(this).css("background-color", "#0000FF")
        },
        function(){
            $(this).css("background-color", "#CCCCCC")
        }
    )

    $(".edit_btn").hover(
        function(){
            $(this).css("background-color", "#555555")
            $(this).css("cursor", "pointer")
        },
        function(){
            $(this).css("background-color", "#CCCCCC")
            $(this).css("cursor", "text")
        }
    )

    $(".delete_btn").hover(
        function(){
            $(this).css("background-color", "#555555")
            $(this).css("cursor", "pointer")
        },
        function(){
            $(this).css("background-color", "#CCCCCC")
            $(this).css("cursor", "default")
        }
    )

    $(".page_number").hover(
        function(){
            $(this).css("background-color", "#CCCCCC")
        },
        function(){
            $(this).css("background-color", "#ffffff")
        }
    )

    $(".delete_btn").click(function(){
        const href = "/delete/<%= article.id %>"
        if(confirm("Are you sure?")){
            location.href = href
        }else{
            location.href = "/article/<%= article.id %>"
        }

    })

    $(".hamburger").on("click", function(){
        $(this).toggleClass("cross")
        $(".menu_box").fadeToggle(300)
        $("body").toggleClass("non_scroll")  
    })

    
   
});