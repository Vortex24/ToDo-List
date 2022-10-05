const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://Vortex:vortex@cluster0.glwfvzx.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Buy Food"
});

const item2 = new Item({
    name: "Cook Food"
});

const item3 = new Item({
    name: "Eat Food"
});

const defaultItems = [ item1, item2, item3 ];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
    let day = date.getDate();
    Item.find({}, function(err, results){
        if (results.length === 0)
        {
            Item.insertMany(defaultItems, function(err){
                if (err)
                    console.log(err);
                else
                    console.log("Insertion Successfull!");
            });

            res.redirect("/");
        }
        else
            res.render("list", { pageTitle: day, kindOfItem: results });
    });
});

app.post("/", function(req, res)
{
    let itemName = req.body.num1;
    let listName = req.body.list;
    let day = date.getDate();

    const item = new Item({
        name: itemName
    });

    if (listName === day)
    {
        item.save();

        res.redirect("/");
    }
    else
    {
        List.findOne({name: listName}, function(err, results){
            results.items.push(item);
            results.save();

            console.log("New Item saved!");

            res.redirect("/" + listName);
        });
    }
});


// Deleting the tasks --->

app.post("/delete", function(req, res){
    const deleteItemId = req.body.checkBox;
    const deleteListName = req.body.listName;
    let day = date.getDate();

    if (deleteListName === day)
    {
        Item.findByIdAndRemove(deleteItemId, function(err){
            if (err)
                console.log(err);
            else
                console.log("Deleted a task!");
        });

        res.redirect("/");
    }
    else
    {
        List.findOneAndUpdate({name: deleteListName}, {$pull: {items: {_id: deleteItemId}}}, function(err){
            if (err)
                console.log(err);
            else
                console.log("Deleted a task!");
        });

        res.redirect("/" + deleteListName);
    }
});

// Making custom Todo Lists --->

app.get("/:pageTitle", function(req, res){
    const Title = _.startCase(req.params.pageTitle);

    List.findOne({name: Title}, function(err, results){
        if (!err)
        {
            if (results)
            {
                res.render("list", { pageTitle: results.name, kindOfItem: results.items });
            }
            else
            {
                const list = new List({
                    name: Title,
                    items: defaultItems
                });

                list.save();

                console.log("New Item saved!");

                res.redirect("/" + Title);
            }
        }
    });
});

app.get("/about", function(req, res){
    res.render("about");
});

app.listen(process.env.PORT || 3000, function(req, res){
    console.log("Running on port 3000...");
});
