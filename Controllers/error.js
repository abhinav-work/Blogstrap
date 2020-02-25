exports.getError = (req, res, next) => {
    res.status(404).render('404',
        { pageTitle: "404 Page Not Found"}
        );
};

exports.get500Error = (req, res, next) => {
  res.status(500).render('500', 
      { pageTitle: "Error" }
    );
};