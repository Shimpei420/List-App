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
            $(this).css("color", "#0000FF");

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

   
});